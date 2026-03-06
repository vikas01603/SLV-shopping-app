const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../uploads");
const imageDir = path.join(uploadDir, "images");
const fileDir = path.join(uploadDir, "files");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir);
if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir);

const storage = multer.diskStorage({
    destination(req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, "uploads/images/");
        } else {
            cb(null, "uploads/files/");
        }
    },
    filename(req, file, cb) {
        cb(
            null,
            `${uuidv4()}${path.extname(file.originalname)}`
        );
    },
});

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
