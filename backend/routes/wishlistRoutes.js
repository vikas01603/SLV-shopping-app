const express = require("express");
const User = require("../models/User");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/users/wishlist
// @desc  Toggle product in user's wishlist
// @access Private
router.post("/wishlist", protect, async (req, res) => {
    const { productId } = req.body;
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const index = user.wishlist.indexOf(productId);

        if (index > -1) {
            // Product is already in wishlist, remove it
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ message: "Product removed from wishlist", wishlist: user.wishlist });
        } else {
            // Add product to wishlist
            user.wishlist.push(productId);
            await user.save();
            res.json({ message: "Product added to wishlist", wishlist: user.wishlist });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// @route GET /api/users/wishlist
// @desc  Get user's wishlist
// @access Private
router.get("/wishlist", protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user.wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
