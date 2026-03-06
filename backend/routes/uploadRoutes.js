const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

require("dotenv").config();
const router = express.Router();

// cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Multer setup using memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route POST /api/upload
// @desc Upload an image/file to Cloudinary
// @access Private
router.post("/", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Security Validation
        if (req.file.size > 10 * 1024 * 1024) {
            return res.status(400).json({ message: "File size exceeds 10MB limit." });
        }

        const forbiddenExtensions = [".exe", ".sh", ".bat", ".cmd"];
        const originalName = req.file.originalname.toLowerCase();
        if (forbiddenExtensions.some(ext => originalName.endsWith(ext))) {
            return res.status(400).json({ message: "Executable files are not allowed." });
        }

        //Function to handle the stream upload to cloudinary
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream({ resource_type: "auto" }, (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                });

                //use streamifier to convert file buffer to a stream
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };
        //call the streamUpload function
        const result = await streamUpload(req.file.buffer);

        //Respond with the uploaded file URL
        res.json({
            imageUrl: result.secure_url,
            format: result.format || result.resource_type,
            originalName: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "server error" });
    }
});

module.exports = router;