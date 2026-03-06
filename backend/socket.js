const fs = require('fs');
const path = require('path');
const ChatRoom = require('./models/ChatRoom');
const ChatMessage = require('./models/ChatMessage');

// Track online status
const activeConnections = new Map(); // socket.id -> { userId, role }

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log("User connected:", socket.id);

        socket.on('user_connect', (data) => {
            const { userId, role } = data;
            activeConnections.set(socket.id, { userId, role });

            // Broadcast newly online user to admins
            if (role === 'User') {
                io.emit('user_status_change', { userId, isOnline: true });
            } else if (role === 'admin') {
                io.emit('admin_status', true);
            }
        });

        // Whenever someone checks
        socket.on('check_admin_status', () => {
            const hasAdmin = Array.from(activeConnections.values()).some(c => c.role === 'admin');
            socket.emit('admin_status', hasAdmin);
        });

        // Join a specific chat room
        socket.on('join_room', (roomId) => {
            socket.join(roomId);
        });

        // Handle sending a message
        socket.on('send_message', async (data) => {
            console.log("Received send_message Payload:", data);
            const { roomId, sender, senderType, message, messageType, fileUrl, fileName, fileSize, mimeType, replyTo } = data;

            try {
                // Save message to DB
                const newMessage = new ChatMessage({
                    room: roomId,
                    sender,
                    senderType,
                    message,
                    messageType: messageType || 'text',
                    fileUrl,
                    fileName,
                    fileSize,
                    mimeType,
                    replyTo,
                    status: 'Delivered'
                });
                await newMessage.save();

                // Update Chat Room
                const updateData = {
                    lastMessage: message,
                    lastMessageAt: Date.now(),
                    status: 'Open'
                };

                if (senderType === 'User') {
                    updateData.$inc = { unreadCountAdmin: 1 };
                } else {
                    updateData.$inc = { unreadCountUser: 1 };
                }

                const room = await ChatRoom.findByIdAndUpdate(roomId, updateData, { new: true }).populate('user', 'name email').populate('admin', 'name email');

                // Broadcast to people in the room
                io.to(roomId).emit('receive_message', newMessage);

                // Broadcast to admin dashboard about room update
                io.emit('admin_room_update', room);

            } catch (err) {
                console.error("Error saving message:", err);
            }
        });

        socket.on('typing', (data) => {
            socket.to(data.roomId).emit('display_typing', data);
        });

        // Edit message
        socket.on('edit_message', async (data) => {
            const { messageId, newText, roomId } = data;
            try {
                console.log("Edit message request:", data);
                const message = await ChatMessage.findByIdAndUpdate(
                    messageId,
                    { message: newText, isEdited: true, editedAt: new Date() },
                    { new: true }
                );
                io.to(roomId).emit('message_edited', message);
                console.log("Message successfully edited:", messageId);
            } catch (err) {
                console.error("Error editing message:", err);
            }
        });

        // Delete message
        socket.on('delete_message', async (data) => {
            const { messageId, roomId, deleteForEveryone, deletedBy } = data;
            try {
                console.log("Delete message request:", data);

                const updatePayload = {};

                if (deleteForEveryone) {

                    // Retrieve original message to get fileUrl
                    const originalMessage = await ChatMessage.findById(messageId);
                    if (originalMessage && originalMessage.fileUrl) {
                        const filePath = path.join(__dirname, originalMessage.fileUrl);
                        if (fs.existsSync(filePath)) {
                            try {
                                fs.unlinkSync(filePath);
                                console.log(`Deleted attachment file from disk: ${filePath}`);
                            } catch (fileErr) {
                                console.error(`Error deleting attachment: ${fileErr}`);
                            }
                        }
                    }

                    updatePayload.isDeleted = true;
                    updatePayload.deletedForEveryone = true;
                    updatePayload.deletedBy = deletedBy;
                    updatePayload.message = "This message was deleted";
                    updatePayload.fileUrl = null;
                    updatePayload.messageType = "text";
                } else {
                    // Soft delete for the person who deleted it
                    // The easiest array approach or we can just flag it
                    // Assuming ChatMessage schema has a deletedBy array or similar, here we just use `deletedBy` if it's string
                    updatePayload.isDeleted = true;
                    updatePayload.deletedBy = deletedBy;
                }

                const message = await ChatMessage.findByIdAndUpdate(messageId, updatePayload, { new: true });
                io.to(roomId).emit('message_deleted', message);
                console.log("Message successfully deleted:", messageId, "For everyone:", deleteForEveryone);
            } catch (err) {
                console.error("Error deleting message:", err);
            }
        });

        // Delete conversation
        socket.on('delete_conversation', (data) => {
            const { roomId } = data;
            io.emit('conversation_deleted', { roomId });
        });

        // Add reaction
        socket.on('reaction_added', async (data) => {
            const { messageId, roomId, emoji, userId } = data;
            try {
                const message = await ChatMessage.findById(messageId);
                const existingReactionIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString() && r.emoji === emoji);
                if (existingReactionIndex > -1) {
                    message.reactions.splice(existingReactionIndex, 1);
                } else {
                    message.reactions.push({ emoji, userId });
                }
                await message.save();
                io.to(roomId).emit('message_reaction', { messageId, reactions: message.reactions });
            } catch (err) {
                console.error("Error adding reaction:", err);
            }
        });

        socket.on('mark_read', async (data) => {
            const { roomId, readerType } = data;

            try {
                const updateField = readerType === 'Admin' ? 'unreadCountAdmin' : 'unreadCountUser';
                await ChatRoom.findByIdAndUpdate(roomId, { [updateField]: 0 });

                const senderTypeFilter = readerType === 'Admin' ? 'User' : 'Admin';
                await ChatMessage.updateMany(
                    { room: roomId, senderType: senderTypeFilter, status: { $ne: 'Seen' } },
                    { $set: { status: 'Seen' } }
                );

                io.to(roomId).emit('messages_seen', { readerType });
            } catch (error) {
                console.error("Error marking as read", error);
            }
        });

        socket.on('disconnect', () => {
            const info = activeConnections.get(socket.id);
            if (info) {
                if (info.role === 'admin') {
                    // Check if other admins are online
                    const hasAdmin = Array.from(activeConnections.values()).some(c => c.role === 'admin' && c !== info);
                    io.emit('admin_status', hasAdmin);
                } else if (info.role === 'User') {
                    // Tell admins this user is offline
                    io.emit('user_status_change', { userId: info.userId, isOnline: false });
                }
            }
            activeConnections.delete(socket.id);
        });
    });
};
