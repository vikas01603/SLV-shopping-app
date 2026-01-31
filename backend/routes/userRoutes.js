const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// @route POST /api/users/register
// @desc Register a new user
// @access Public
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        //Registeration logic
        let user = await User.findOne({ email });

        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ name, email, password });
        await user.save();

        // Create JWT Payload
        const payload = { user: { id: user._id, role: user.role } };

        //sign and return the token along with user data
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "400h" }, (err, token) => {
            if (err) throw err;

            //Send the user and token in response
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            })
        });
    } catch (error) {
        console.log(error);
        res.status(500).send("Server error");
    }
});

// @route POST /api/users/login
// @desc Authenticate a user
// @access Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Finding a user by email
        let user = await User.findOne({ email });

        if (!user) return res.status(400).json({ message: "Invalid Credentials" });
        const isMatch = await user.matchPassword(password);

        if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

        // Create JWT Payload
        const payload = { user: { id: user._id, role: user.role } };

        //sign and return the token along with user data
        jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "400h" }, (err, token) => {
            if (err) throw err;

            //Send the user and token in response
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                token,
            })
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

//@route GET /api/users/profile
//@desc Get logged in user's profile (Protected Route)
//@access Private
router.get("/profile", protect, async (req, res) => {
    res.json(req.user);

});


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

        if (!user.wishlist) {
            user.wishlist = [];
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
