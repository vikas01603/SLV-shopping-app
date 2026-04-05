const express = require("express");
const router = express.Router();
const SecurityLog = require("../models/SecurityLog");
const SecurityAlert = require("../models/SecurityAlert");
const AdminAuditLog = require("../models/AdminAuditLog");
const BlockedEntity = require("../models/BlockedEntity");
const User = require("../models/User");
const { logAdminAction } = require("../services/securityService");

// Get security metrics
router.get("/metrics", async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalLoginsToday,
            failedLoginsToday,
            activeUsersLastHour,
            unresolvedAlerts,
            paymentFailuresToday
        ] = await Promise.all([
            SecurityLog.countDocuments({ action: { $regex: /\/api\/users\/login/i }, status: "SUCCESS", timestamp: { $gte: today } }),
            SecurityLog.countDocuments({ action: { $regex: /\/api\/users\/login/i }, status: "FAILED", timestamp: { $gte: today } }),
            SecurityLog.distinct("userId", { timestamp: { $gte: new Date(Date.now() - 3600000) } }).then(users => users.length),
            SecurityAlert.countDocuments({ isResolved: false }),
            SecurityLog.countDocuments({ action: { $regex: /checkout|pay/i }, status: "FAILED", timestamp: { $gte: today } })
        ]);

        res.json({
            totalLoginsToday,
            failedLoginsToday,
            activeUsersLastHour,
            unresolvedAlerts,
            paymentFailuresToday
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching metrics", error: err.message });
    }
});

// Get logs (paginated)
router.get("/logs", async (req, res) => {
    try {
        const { page = 1, limit = 20, type, status, userId, startDate, endDate } = req.query;
        const query = {};

        if (type) query.action = { $regex: type, $options: "i" };
        if (status) query.status = status;
        if (userId) query.userId = userId;
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const logs = await SecurityLog.find(query)
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate("userId", "name email role")
            .populate("adminId", "name email");

        const count = await SecurityLog.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalLogs: count
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching logs" });
    }
});

// Get alerts
router.get("/alerts", async (req, res) => {
    try {
        const alerts = await SecurityAlert.find()
            .sort({ timestamp: -1, severity: 1 })
            .populate("relatedUser", "name email")
            .populate("resolvedBy", "name");
        res.json(alerts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching alerts" });
    }
});

// Mark alert as resolved
router.put("/alerts/:id/resolve", async (req, res) => {
    try {
        const alert = await SecurityAlert.findByIdAndUpdate(req.params.id, {
            isResolved: true,
            resolvedBy: req.user._id,
            resolvedAt: new Date()
        }, { new: true });
        
        await logAdminAction({
            adminId: req.user._id,
            action: "RESOLVE_ALERT",
            targetType: "SECURITY",
            targetId: alert._id,
            description: `Resolved security alert: ${alert.alertType}`,
            ip: req.ip
        });
        
        res.json(alert);
        // Emit real-time sync event
        if (req.io) req.io.emit("alert_resolved", alert);
    } catch (err) {
        res.status(500).json({ message: "Error resolving alert" });
    }
});

// Manage Blocks
router.post("/blocks", async (req, res) => {
    try {
        const { type, value, reason, durationHours } = req.body;
        
        const expiresAt = durationHours ? new Date(Date.now() + durationHours * 3600000) : null;
        
        const block = new BlockedEntity({
            type,
            value,
            reason,
            expiresAt,
            managedBy: req.user._id
        });
        await block.save();

        if (type === "USER") {
            // Deactivate user account temporarily if user block
            await User.findByIdAndUpdate(value, { isBlocked: true });
        }

        await logAdminAction({
            adminId: req.user._id,
            action: `BLOCK_${type}`,
            targetType: "SECURITY",
            targetId: block._id,
            description: `Blocked ${type}: ${value} for ${reason}`,
            ip: req.ip
        });

        res.json(block);
        // Emit real-time sync event 
        if (req.io) req.io.emit("new_block", block);
    } catch (err) {
        res.status(500).json({ message: "Error creating block" });
    }
});

router.get("/blocks", async (req, res) => {
    const blocks = await BlockedEntity.find({ deleted: false }).populate("managedBy", "name");
    res.json(blocks);
});

router.delete("/blocks/:id", async (req, res) => {
    try {
        const block = await BlockedEntity.findByIdAndUpdate(req.params.id, { deleted: true }, { new: true });
        
        if (block.type === "USER") {
            await User.findByIdAndUpdate(block.value, { isBlocked: false });
        }

        await logAdminAction({
            adminId: req.user._id,
            action: `UNBLOCK_${block.type}`,
            targetType: "SECURITY",
            targetId: block._id,
            description: `Unblocked ${block.type}: ${block.value}`,
            ip: req.ip
        });

        res.json({ message: "Unblocked successfully", blockId: req.params.id });
        // Emit real-time sync event
        if (req.io) req.io.emit("block_removed", req.params.id);
    } catch (err) {
        res.status(500).json({ message: "Error removing block" });
    }
});

// Admin Audit Logs
router.get("/audit-logs", async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const logs = await AdminAuditLog.find()
            .sort({ timestamp: -1 })
            .limit(limit * 1)
            .populate("adminId", "name email");
        res.json(logs);
    } catch (err) {
        res.status(500).json({ message: "Error fetching audit logs" });
    }
});

module.exports = router;
