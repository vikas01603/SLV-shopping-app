const express = require("express");
const router = express.Router();
const { protect, admin } = require("../middleware/authMiddleware");
const { getUserRoom, getAllRooms, getMessages, closeRoom, uploadFile, deleteConversation } = require("../controllers/chatController");
const uploadChatAttachment = require("../middleware/uploadChatMiddleware");

// User routes
router.get("/my-room", protect, getUserRoom);

// Common routes
router.get("/:roomId/messages", protect, getMessages);
router.post("/upload", protect, uploadChatAttachment.single("file"), uploadFile);

// Admin routes
router.get("/all-rooms", protect, admin, getAllRooms);
router.put("/:roomId/close", protect, admin, closeRoom);
router.delete("/conversation/:conversationId", protect, admin, deleteConversation);

module.exports = router;
