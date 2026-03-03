const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { protect } = require("../middleware/authMiddleware");
const { OAuth2Client } = require("google-auth-library");

const router = express.Router();

// Initialize Google OAuth Client with the client ID used in the frontend
// We can use the environment variable or hardcode it since it is public anyways.
const googleClient = new OAuth2Client("677043176412-25gel7dvqkvho5ghes5r3jn5ao92og3f.apps.googleusercontent.com");

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
                    phone: user.phone,
                    address: user.address,
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
                    phone: user.phone,
                    address: user.address,
                },
                token,
            })
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// @route POST /api/users/google-login
// @desc Authenticate a user with Google OAuth
// @access Public
router.post("/google-login", async (req, res) => {
    const { credential } = req.body;
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: "677043176412-25gel7dvqkvho5ghes5r3jn5ao92og3f.apps.googleusercontent.com",
        });
        const payload = ticket.getPayload();
        const { email, name } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // Create user if they don't exist
            user = new User({
                name: name,
                email: email,
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Dummy password
            });
            await user.save();
        }

        // Create JWT Payload
        const jwtPayload = { user: { id: user._id, role: user.role } };

        jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: "400h" }, (err, token) => {
            if (err) throw err;
            res.json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    address: user.address,
                },
                token,
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Invalid Google Credential" });
    }
});

//@route GET /api/users/profile
//@desc Get logged in user's profile (Protected Route)
//@access Private
router.get("/profile", protect, async (req, res) => {
    res.json(req.user);
});

// @route PUT /api/users/profile
// @desc Update user profile
// @access Private
router.put("/profile", protect, async (req, res) => {
    const { name, phone, address, password } = req.body;
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;

        if (password) {
            if (!req.body.currentPassword) {
                return res.status(400).json({ message: "Current password is required to set a new password" });
            }

            const isMatch = await user.matchPassword(req.body.currentPassword);
            if (!isMatch) {
                return res.status(400).json({ message: "Incorrect current password" });
            }

            user.password = password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            address: updatedUser.address,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
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
