const express = require("express");
const Order = require("../models/Order");
const Notification = require("../models/Notification");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route GET /api/admin/orders
// @desc Get all orders (Admin only)
// @access Private/Admin
router.get("/", protect, admin, async (req, res) => {
    try {
        const orders = await Order.find({}).populate("user", "name email phone address").sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//@route PUT /api/admin/orders/:id
//@desc Update order status (Admin only)
//@access Private/Admin
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email phone address");
        if (order) {
            order.status = req.body.status || order.status;
            order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt = req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

            const updatedOrder = await order.save();

            // Create notification for the user
            if (req.body.status) {
                await Notification.create({
                    user: order.user._id,
                    title: `Order Status Updated`,
                    message: `Your order status has changed to: ${req.body.status}.`,
                    link: `/order/${order._id}`,
                });
            }

            res.json(updatedOrder);

        } else {
            res.status(404).json({ message: "Order not found" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

//@route DELETE /api/admin/orders/:id
//@desc Delete an order (Admin only)
//@access Private/Admin
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: "Order removed successfully" });
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});
module.exports = router;