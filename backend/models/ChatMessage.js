const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
    {
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatRoom",
            required: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderType: {
            type: String,
            enum: ["User", "Admin"],
            required: true,
        },
        message: {
            type: String,
            default: "", // Default to empty if just uploading attachment
        },
        messageType: {
            type: String,
            enum: ['text', 'image', 'file'],
            default: 'text',
        },
        fileUrl: {
            type: String,
            default: null,
        },
        fileName: {
            type: String,
            default: null,
        },
        fileSize: {
            type: Number,
            default: null,
        },
        mimeType: {
            type: String,
            default: null,
        },
        reactions: [
            {
                emoji: String,
                userId: mongoose.Schema.Types.ObjectId,
            }
        ],
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatMessage",
            default: null,
        },
        isEdited: {
            type: Boolean,
            default: false,
        },
        editedAt: {
            type: Date,
            default: null,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedForEveryone: {
            type: Boolean,
            default: false,
        },
        deletedBy: {
            type: String, // 'User' or 'Admin'
            default: null,
        },
        status: {
            type: String,
            enum: ["Sent", "Delivered", "Seen"],
            default: "Sent",
        },
        isPinned: {
            type: Boolean,
            default: false,
        },
        isBookmarked: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },
        forwardedFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ChatMessage",
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
