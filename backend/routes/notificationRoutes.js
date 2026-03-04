const express = require("express");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/notifications
// @desc Get all notifications for the logged-in user
// @access Private
router.get("/", protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route PUT /api/notifications/:id/read
// @desc Mark a single notification as read
// @access Private
router.put("/:id/read", protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (notification) {
            // Ensure the notification belongs to the user
            if (notification.user.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: "Not authorized" });
            }

            notification.isRead = true;
            const updatedNotification = await notification.save();
            res.json(updatedNotification);
        } else {
            res.status(404).json({ message: "Notification not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route PUT /api/notifications/read-all
// @desc Mark all notifications as read for the logged-in user
// @access Private
router.put("/read-all", protect, async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route POST /api/notifications/announce
// @desc Send a global announcement to all users (Admin only)
// @access Private/Admin
router.post("/announce", protect, admin, async (req, res) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: "Please provide both title and message" });
        }

        const allUsers = await User.find({});

        if (allUsers.length > 0) {
            const notificationsData = allUsers.map((user) => ({
                user: user._id,
                title,
                message,
            }));
            await Notification.insertMany(notificationsData);
        }

        res.status(201).json({ message: "Announcement sent to all users" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route DELETE /api/notifications/:id
// @desc Delete a single notification
// @access Private
router.delete("/:id", protect, async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        // Ensure the notification belongs to the user
        if (notification.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized to delete this notification" });
        }

        await notification.deleteOne();
        res.json({ message: "Notification removed" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
