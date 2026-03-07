const fs = require('fs');
const path = require('path');
const ChatRoom = require("../models/ChatRoom");
const ChatMessage = require("../models/ChatMessage");
const User = require("../models/User"); // Ensure user model exists

// Get or Create Room for User
const getUserRoom = async (req, res) => {
    try {
        const userId = req.user._id;

        // Check if an open room exists
        let room = await ChatRoom.findOne({ user: userId }).populate("user", "name email");

        if (!room) {
            room = new ChatRoom({
                user: userId,
            });
            await room.save();
        }

        res.status(200).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Get all rooms
const getAllRooms = async (req, res) => {
    try {
        const rooms = await ChatRoom.find()
            .populate("user", "name email lastSeen")
            .populate("admin", "name email")
            .populate("assignedTo", "name email")
            .sort({ lastMessageAt: -1 });
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Messages for a Room
const getMessages = async (req, res) => {
    try {
        const { roomId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // AUTH CHECK: Ensure user owns this room OR is admin
        const room = await ChatRoom.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });
        if (room.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Unauthorized access to these messages" });
        }

        const messages = await ChatMessage.find({ room: roomId })
            .populate("replyTo")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await ChatMessage.countDocuments({ room: roomId });

        // Return messages sorted chronologically for the frontend
        res.status(200).json({
            messages: messages.reverse(),
            page,
            pages: Math.ceil(totalMessages / limit),
            totalMessages
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Admin: Mark Room as Closed
const closeRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const room = await ChatRoom.findByIdAndUpdate(roomId, { status: "Closed" }, { new: true });
        res.status(200).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const isImage = req.file.mimetype.startsWith('image/');
        const isAudio = req.file.mimetype.startsWith('audio/') || req.file.mimetype.includes('webm');
        const fileType = isImage ? 'images' : (isAudio ? 'audio' : 'files');
        const fileUrl = `/uploads/${fileType === 'audio' ? 'files' : fileType}/${req.file.filename}`;

        res.status(200).json({
            fileUrl,
            fileType: isImage ? 'image' : (isAudio ? 'voice' : 'file'),
            fileName: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Server error during file upload" });
    }
};

const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const room = await ChatRoom.findById(conversationId);
        if (!room) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        // Check if user is owner or admin
        if (room.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: "Not authorized to delete this conversation" });
        }

        const messages = await ChatMessage.find({ room: conversationId });

        // Delete attachments
        messages.forEach(msg => {
            if (msg.fileUrl) {
                const filePath = path.join(__dirname, '..', msg.fileUrl);
                if (fs.existsSync(filePath)) {
                    try {
                        fs.unlinkSync(filePath);
                    } catch (err) {
                        console.error("Error deleting attachment file:", err);
                    }
                }
            }
        });

        // Delete all messages
        await ChatMessage.deleteMany({ room: conversationId });

        // Delete room
        await ChatRoom.findByIdAndDelete(conversationId);

        res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        console.error("Delete conversation error:", error);
        res.status(500).json({ message: "Server error during conversation deletion" });
    }
};

const searchMessages = async (req, res) => {
    try {
        const { query } = req.query;
        const messages = await ChatMessage.find({
            message: { $regex: query, $options: 'i' }
        }).populate('room').limit(20);
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Search error" });
    }
};

const updateRoomStatus = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { status } = req.body;

        // AUTH CHECK: Admin only for status change (already enforced by routes, but double-down)
        if (req.user.role !== 'admin') return res.status(403).json({ message: "Admin only" });

        const room = await ChatRoom.findByIdAndUpdate(roomId, { chatStatus: status }, { new: true });
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: "Status update error" });
    }
};

const assignAgent = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { agentId } = req.body;
        const room = await ChatRoom.findByIdAndUpdate(roomId, { assignedTo: agentId }, { new: true }).populate('assignedTo', 'name email');
        res.status(200).json(room);
    } catch (error) {
        res.status(500).json({ message: "Assignment error" });
    }
};

const exportConversation = async (req, res) => {
    try {
        const { roomId } = req.params;
        const messages = await ChatMessage.find({ room: roomId }).sort({ createdAt: 1 });
        const room = await ChatRoom.findById(roomId).populate('user', 'name email');

        let content = `Chat Export - ${room.user.name} (${room.user.email})\n`;
        content += `Date: ${new Date().toLocaleString()}\n\n`;

        messages.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleString();
            content += `[${date}] ${msg.senderType}: ${msg.message || (msg.fileUrl ? '[Attachment]' : '')}\n`;
        });

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Content-Disposition', `attachment; filename=chat_export_${roomId}.txt`);
        res.send(content);
    } catch (error) {
        res.status(500).json({ message: "Export error" });
    }
};

module.exports = {
    getUserRoom,
    getAllRooms,
    getMessages,
    closeRoom,
    uploadFile,
    deleteConversation,
    searchMessages,
    updateRoomStatus,
    assignAgent,
    exportConversation
};
