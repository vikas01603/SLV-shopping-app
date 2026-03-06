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
            .populate("user", "name email")
            .populate("admin", "name email")
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

        const fileType = req.file.mimetype.startsWith('image/') ? 'images' : 'files';
        const fileUrl = `/uploads/${fileType}/${req.file.filename}`;

        res.status(200).json({
            fileUrl,
            fileType: req.file.mimetype.startsWith('image/') ? 'image' : 'file',
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

module.exports = {
    getUserRoom,
    getAllRooms,
    getMessages,
    closeRoom,
    uploadFile,
    deleteConversation,
};
