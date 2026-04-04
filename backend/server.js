const dotenv = require("dotenv");
dotenv.config();
const securityService = require("./services/securityService");
const { securityLogger, blockChecker } = require("./middleware/securityMiddleware");
const securityRoutes = require("./routes/securityRoutes");
const authMiddleware = require("./middleware/authMiddleware"); // Need to ensure only admins can access security routes

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");

const xss = require("xss-clean");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const subscribeRoute = require("./routes/subscribeRoute");
const adminRoutes = require("./routes/adminRoutes");
const productAdminRoutes = require("./routes/productAdminRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

// Pass socket.io to the socket handler
require("./socket")(io);
securityService.init(io);

app.use(express.json());
// Security: Sanitize data
app.use(mongoSanitize());
// Security: Prevent XSS
app.use(xss());
// Security: Prevent Parameter Pollution
app.use(hpp());
// Security: Set security headers
app.use(helmet({
    contentSecurityPolicy: false, // Set to false if using external CDNs or if it breaks things, or customize it
}));

app.use(cors());

// Security: Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, 
    legacyHeaders: false,
});
app.use("/api/", limiter);

// Stricter Rate Limiting for Auth
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 15, // limit each IP to 15 login attempts per hour
    message: "Too many login attempts, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/users/forgot-password", authLimiter);

app.use(securityLogger);
app.use(blockChecker);


const PORT = process.env.PORT || 3000;

//connection to mongodb database
connectDB();

app.get("/", (req, res) => {
    res.send("WELCOME TO SLV API!");
});

//API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api", subscribeRoute);

// Static uploads mapping
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Admin Routes
app.use("/api/admin/users", adminRoutes);
app.use("/api/admin/products", productAdminRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/security", authMiddleware.protect, (req, res, next) => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "Admin access required" });
    next();
}, securityRoutes);


// Export for Vercel
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Start server only if not in Vercel serverless environment
if (!process.env.VERCEL) {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;