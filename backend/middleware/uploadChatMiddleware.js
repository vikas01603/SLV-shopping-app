const multer = require("multer");
const path = require("path");

// Use memory storage for serverless compatibility (Vercel/Cloudinary)
const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
    // Rejected extensions from requirements
    const rejectedExts = /exe|sh|bat$/;
    const extname = path.extname(file.originalname).toLowerCase();

    if (rejectedExts.test(extname)) {
        return cb(new Error("Executable files are not allowed"));
    }

    const filetypes = /jpg|jpeg|png|webp|gif|pdf|doc|docx|txt|zip/;
    const isValidExt = filetypes.test(extname);

    if (isValidExt || file.mimetype.startsWith("image/") || file.mimetype.startsWith("application/") || file.mimetype.startsWith("text/")) {
        return cb(null, true);
    } else {
        cb(new Error("Invalid file type"));
    }
};

const uploadChatAttachment = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = uploadChatAttachment;
