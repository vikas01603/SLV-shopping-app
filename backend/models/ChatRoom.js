const mongoose = require("mongoose");

const chatRoomSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["Open", "Closed"],
            default: "Open",
        },
        lastMessage: {
            type: String,
        },
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
        unreadCountAdmin: {
            type: Number,
            default: 0,
        },
        unreadCountUser: {
            type: Number,
            default: 0,
        },
        chatStatus: {
            type: String,
            enum: ["Open", "Pending", "Resolved"],
            default: "Open",
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Support agent
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
