const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const {
    getUserRoom, getAllRooms, getMessages, closeRoom, uploadFile,
    deleteConversation, searchMessages, updateRoomStatus, assignAgent, exportConversation
} = require("../controllers/chatController");
const uploadChatAttachment = require("../middleware/uploadChatMiddleware");

// User routes
router.get("/my-room", protect, getUserRoom);

// Common routes
router.get("/:roomId/messages", protect, getMessages);
router.post("/upload", protect, uploadChatAttachment.single("file"), uploadFile);

// Admin routes
router.get("/all-rooms", protect, admin, getAllRooms);
router.get("/search", protect, admin, searchMessages);
router.put("/:roomId/status", protect, admin, updateRoomStatus);
router.put("/:roomId/assign", protect, admin, assignAgent);
router.get("/:roomId/export", protect, admin, exportConversation);
router.put("/:roomId/close", protect, admin, closeRoom);
router.delete("/conversation/:conversationId", protect, deleteConversation);

module.exports = router;
