const { isBlocked, logActivity } = require("../services/securityService");
const jwt = require("jsonwebtoken");

const securityLogger = async (req, res, next) => {
  const start = Date.now();

  // Skip logging for standard static files or health checks if needed
  if (req.path.includes("/uploads") || req.path === "/") {
    return next();
  }

  res.on("finish", async () => {
    try {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;
      const status = statusCode >= 400 ? "FAILED" : "SUCCESS";

      // Attempt to get user ID if authenticated
      let userId = req.user ? req.user._id : null;
      let adminId = (req.user && req.user.role === "admin") ? req.user._id : null;

      if (!userId && req.headers.authorization) {
        try {
          const token = req.headers.authorization.split(" ")[1];
          // Decouple from any quotes if stringified
          const cleanToken = token.startsWith('"') ? token.slice(1, -1) : token;
          const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
          userId = decoded.user?.id || decoded.id;

          const role = decoded.user?.role || decoded.role;
          if (role === "admin") {
            adminId = userId;
          }
        } catch (e) { /* ignore auth error in logger */ }
      }

      const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
      const userAgent = req.headers["user-agent"];

      // Simple device info extraction
      const deviceInfo = {
        browser: userAgent ? (userAgent.includes("Chrome") ? "Chrome" : userAgent.includes("Firefox") ? "Firefox" : userAgent.includes("Safari") ? "Safari" : "Other") : "Unknown",
        os: userAgent ? (userAgent.includes("Windows") ? "Windows" : userAgent.includes("Mac") ? "Mac" : userAgent.includes("Linux") ? "Linux" : "Other") : "Unknown",
        device: userAgent ? (userAgent.includes("Mobi") ? "Mobile" : "Desktop") : "Unknown"
      };

      // Only log significant actions or errors (mutating requests)
      const action = req.method + " " + req.originalUrl;
      const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);

      // We can filter what to log here to avoid database bloat
      const criticalRoutes = ["/api/users", "/api/checkout", "/api/admin", "/api/cart"];
      const isCritical = criticalRoutes.some(route => req.originalUrl.includes(route));

      // Avoid double-logging routes that are manually logged in controllers
      const manuallyLogged = (statusCode >= 400 && (req.originalUrl.includes("/api/users/login") || req.originalUrl.includes("/api/users/forgot-password")));

      if (((isCritical && isMutation) || statusCode >= 400) && !manuallyLogged) {
        await logActivity({
          userId: userId,
          adminId: adminId,
          action: action,
          status: status,
          ip: ip,
          userAgent: userAgent,
          deviceInfo: deviceInfo,
          metadata: {
            method: req.method,
            path: req.originalUrl,
            params: req.params,
            duration: `${duration}ms`,
            statusCode: statusCode
          }
        });
      }
    } catch (error) {
      console.error("Security Logger Middleware Error:", error);
    }
  });

  next();
};

const blockChecker = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    let userId = req.user ? req.user._id : null;

    // Attempt to get user ID from token if not already present
    if (!userId && req.headers.authorization) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user?.id || decoded.id;
      } catch (e) { /* ignore */ }
    }

    if (await isBlocked(ip, userId)) {
      return res.status(403).json({
        message: "Access denied. Your IP or account has been temporarily blocked for security reasons.",
        error: "SECURITY_BLOCK",
      });
    }
    next();
  } catch (error) {
    console.error("Security Block Checker Error:", error);
    res.status(500).json({ message: "Internal Security Error" });
  }
};

module.exports = {
  securityLogger,
  blockChecker
};
