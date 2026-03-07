const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const ChatRoom = require('./models/ChatRoom');
const ChatMessage = require('./models/ChatMessage');
const User = require('./models/User');

// Track online status
const activeConnections = new Map(); // socket.id -> { userId, role }
const userSockets = new Map(); // userId -> Set of socket.ids (for multi-device sync)

module.exports = (io) => {
    // Middleware for Socket.IO Authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // Compatibility with existing authMiddleware structure
            const userId = decoded.user?.id || decoded.id;

            const user = await User.findById(userId).select("-password");
            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (err) {
            console.error("Socket Auth Error:", err.message);
            next(new Error("Authentication error: Invalid token"));
        }
    });

    // Helper to verify room access
    const checkRoomAccess = async (socket, roomId) => {
        if (socket.user.role === 'admin') return true;

        const room = await ChatRoom.findById(roomId);
        if (!room) return false;

        // Ensure user can only access their own room
        return room.user.toString() === socket.user._id.toString();
    };

    io.on('connection', (socket) => {
        const user = socket.user;
        console.log(`User ${user.name} (${user.role}) connected: ${socket.id}`);

        // Track connection
        activeConnections.set(socket.id, { userId: user._id, role: user.role });
        if (!userSockets.has(user._id.toString())) {
            userSockets.set(user._id.toString(), new Set());
        }
        userSockets.get(user._id.toString()).add(socket.id);

        // Broadcast status
        if (user.role === 'admin') {
            io.emit('admin_status', true);
        } else {
            io.emit('user_status_change', { userId: user._id, isOnline: true });
        }

        // Standard user_connect is now handled by middleware, but kept for legacy frontend logic if needed
        socket.on('user_connect', async () => {
            await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });
        });

        socket.on('check_admin_status', () => {
            const hasAdmin = Array.from(activeConnections.values()).some(c => c.role === 'admin');
            socket.emit('admin_status', hasAdmin);
        });

        socket.on('join_room', async (roomId) => {
            if (await checkRoomAccess(socket, roomId)) {
                socket.join(roomId);
            } else {
                socket.emit('error', { message: "Unauthorized room access" });
            }
        });

        socket.on('send_message', async (data) => {
            const { roomId, message, messageType, fileUrl, fileName, fileSize, mimeType, replyTo } = data;

            try {
                if (!(await checkRoomAccess(socket, roomId))) {
                    return socket.emit('error', { message: "Unauthorized to send message here" });
                }

                const newMessage = new ChatMessage({
                    room: roomId,
                    sender: user._id, // Secure: Use authenticated user ID
                    senderType: user.role === 'admin' ? 'Admin' : 'User',
                    message,
                    messageType: messageType || 'text',
                    fileUrl,
                    fileName,
                    fileSize,
                    mimeType,
                    replyTo,
                    status: 'Sent'
                });
                await newMessage.save();

                const updateData = {
                    lastMessage: message || (messageType === 'image' ? 'Sent an image' : 'Sent an attachment'),
                    lastMessageAt: Date.now()
                };

                if (user.role === 'admin') {
                    updateData.$inc = { unreadCountUser: 1 };
                } else {
                    updateData.$inc = { unreadCountAdmin: 1 };
                }

                const room = await ChatRoom.findByIdAndUpdate(roomId, updateData, { new: true })
                    .populate('user', 'name email lastSeen')
                    .populate('admin', 'name email');

                // Confirmation to sender devices
                if (userSockets.has(user._id.toString())) {
                    userSockets.get(user._id.toString()).forEach(sId => {
                        io.to(sId).emit('message_sent', newMessage);
                    });
                }

                socket.to(roomId).emit('receive_message', newMessage);
                io.emit('admin_room_update', room);

            } catch (err) {
                console.error("Error saving message:", err);
                socket.emit('message_error', { message: "Failed to send message" });
            }
        });

        socket.on('update_room_status', async (data) => {
            const { roomId, status } = data;
            if (user.role !== 'admin') return;

            try {
                const room = await ChatRoom.findByIdAndUpdate(roomId, { chatStatus: status }, { new: true })
                    .populate('user', 'name email lastSeen')
                    .populate('admin', 'name email');

                if (room) {
                    io.to(roomId).emit('room_status_updated', { roomId, status });
                    io.emit('admin_room_update', room);
                }
            } catch (err) {
                console.error("Error updating status:", err);
            }
        });

        socket.on('message_delivered', async (data) => {
            const { messageId, roomId } = data;
            if (!(await checkRoomAccess(socket, roomId))) return;
            try {
                const message = await ChatMessage.findByIdAndUpdate(messageId, { status: 'Delivered' }, { new: true });
                if (message) {
                    io.to(roomId).emit('message_status_update', { messageId, status: 'Delivered' });
                }
            } catch (err) { }
        });

        socket.on('typing_start', (data) => {
            const { roomId } = data;
            socket.to(roomId).emit('display_typing', { roomId, senderType: user.role === 'admin' ? 'Admin' : 'User', isTyping: true });
        });

        socket.on('typing_stop', (data) => {
            const { roomId } = data;
            socket.to(roomId).emit('display_typing', { roomId, senderType: user.role === 'admin' ? 'Admin' : 'User', isTyping: false });
        });

        socket.on('edit_message', async (data) => {
            const { messageId, newText, roomId } = data;
            if (!(await checkRoomAccess(socket, roomId))) return;
            try {
                const message = await ChatMessage.findById(messageId);
                if (!message || message.sender.toString() !== user._id.toString()) return;

                message.message = newText;
                message.isEdited = true;
                message.editedAt = new Date();
                await message.save();
                io.to(roomId).emit('message_edited', message);
            } catch (err) { }
        });

        socket.on('delete_message', async (data) => {
            const { messageId, roomId, deleteForEveryone } = data;
            if (!(await checkRoomAccess(socket, roomId))) return;
            try {
                const message = await ChatMessage.findById(messageId);
                if (!message) return;

                // Only sender or admin can delete
                if (message.sender.toString() !== user._id.toString() && user.role !== 'admin') return;

                if (deleteForEveryone) {
                    if (message.fileUrl) {
                        const filePath = path.join(__dirname, message.fileUrl);
                        if (fs.existsSync(filePath)) {
                            try { fs.unlinkSync(filePath); } catch (e) { }
                        }
                    }
                    message.isDeleted = true;
                    message.deletedForEveryone = true;
                    message.deletedBy = user.role === 'admin' ? 'Admin' : 'User';
                    message.message = "This message was deleted";
                    message.fileUrl = null;
                    message.messageType = "text";
                } else {
                    message.isDeleted = true;
                    message.deletedBy = user.role === 'admin' ? 'Admin' : 'User';
                }
                await message.save();
                io.to(roomId).emit('message_deleted', message);
            } catch (err) { }
        });

        socket.on('reaction_added', async (data) => {
            const { messageId, roomId, emoji } = data;
            if (!(await checkRoomAccess(socket, roomId))) return;
            try {
                const message = await ChatMessage.findById(messageId);
                const existingReactionIndex = message.reactions.findIndex(r => r.userId.toString() === user._id.toString() && r.emoji === emoji);
                if (existingReactionIndex > -1) {
                    message.reactions.splice(existingReactionIndex, 1);
                } else {
                    message.reactions.push({ emoji, userId: user._id });
                }
                await message.save();
                io.to(roomId).emit('message_reaction', { messageId, reactions: message.reactions });
            } catch (err) { }
        });

        socket.on('mark_read', async (data) => {
            const { roomId } = data;
            if (!(await checkRoomAccess(socket, roomId))) return;
            try {
                const updateField = user.role === 'admin' ? 'unreadCountAdmin' : 'unreadCountUser';
                await ChatRoom.findByIdAndUpdate(roomId, { [updateField]: 0 });

                const senderTypeFilter = user.role === 'admin' ? 'User' : 'Admin';
                await ChatMessage.updateMany(
                    { room: roomId, senderType: senderTypeFilter, status: { $ne: 'Seen' } },
                    { $set: { status: 'Seen' } }
                );

                io.to(roomId).emit('messages_seen', { readerType: user.role === 'admin' ? 'Admin' : 'User' });
            } catch (error) { }
        });

        socket.on('delete_conversation', async (data) => {
            const { roomId } = data;
            if (user.role !== 'admin') return;
            io.to(roomId).emit('conversation_deleted', { roomId });
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.id}`);
            activeConnections.delete(socket.id);
            const sockets = userSockets.get(user._id.toString());
            if (sockets) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    userSockets.delete(user._id.toString());
                    if (user.role === 'admin') {
                        const anyOtherAdmin = Array.from(activeConnections.values()).some(c => c.role === 'admin');
                        if (!anyOtherAdmin) io.emit('admin_status', false);
                    } else {
                        io.emit('user_status_change', { userId: user._id, isOnline: false });
                        await User.findByIdAndUpdate(user._id, { lastSeen: new Date() });
                    }
                }
            }
        });
    });
};
