const SecurityLog = require("../models/SecurityLog");
const SecurityAlert = require("../models/SecurityAlert");
const AdminAuditLog = require("../models/AdminAuditLog");
const BlockedEntity = require("../models/BlockedEntity");
const nodemailer = require("nodemailer");

let ioInstance = null;

const init = (io) => {
  ioInstance = io;
};

const logActivity = async (data) => {
  try {
    const log = new SecurityLog({
      userId: data.userId,
      adminId: data.adminId,
      action: data.action,
      status: data.status,
      ip: data.ip,
      userAgent: data.userAgent,
      deviceInfo: data.deviceInfo,
      metadata: data.metadata,
    });
    await log.save();

    if (ioInstance) {
      ioInstance.emit("new_security_log", log);
    }

    // Brute Force Detection
    if (data.status === "FAILED" && data.action === "LOGIN") {
      await checkBruteForce(data.ip, data.userId);
    }

    return log;
  } catch (error) {
    console.error("Security Logging Error:", error);
  }
};

const logAdminAction = async (data) => {
  try {
    const auditLog = new AdminAuditLog({
      adminId: data.adminId,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      description: data.description,
      prevValue: data.prevValue,
      newValue: data.newValue,
      ip: data.ip,
    });
    await auditLog.save();

    if (ioInstance) {
      ioInstance.emit("new_admin_audit", auditLog);
    }

    return auditLog;
  } catch (error) {
    console.error("Admin Audit Logging Error:", error);
  }
};

const createAlert = async (data) => {
  try {
    const alert = new SecurityAlert({
      alertType: data.alertType,
      severity: data.severity,
      description: data.description,
      relatedUser: data.relatedUser,
      relatedIp: data.relatedIp,
      metadata: data.metadata,
    });
    await alert.save();

    if (ioInstance) {
      ioInstance.emit("new_security_alert", alert);
    }

    if (data.severity === "HIGH") {
      await sendSecurityEmail(alert);
    }

    return alert;
  } catch (error) {
    console.error("Security Alert Error:", error);
  }
};

const checkBruteForce = async (ip, userId) => {
  const timeframe = 15 * 60 * 1000; // 15 mins
  const limit = 5;

  const count = await SecurityLog.countDocuments({
    $or: [{ ip }, { userId: userId || { $exists: false } }],
    action: "LOGIN",
    status: "FAILED",
    timestamp: { $gt: new Date(Date.now() - timeframe) },
  });

  if (count >= limit) {
    await createAlert({
      alertType: "BRUTE_FORCE_ATTEMPT",
      severity: "HIGH",
      description: `Multiple failed login attempts detected from IP: ${ip}`,
      relatedIp: ip,
      relatedUser: userId,
      metadata: { count },
    });
  }
};

const sendSecurityEmail = async (alert) => {
  try {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `SECURITY ALERT: ${alert.alertType} (${alert.severity})`,
      text: `A high severity security alert has been triggered:\n\nType: ${alert.alertType}\nDescription: ${alert.description}\nTime: ${alert.timestamp}\nIP: ${alert.relatedIp}\n\nPlease check the Admin Security Dashboard for more details.`,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Failed to send security email:", error);
  }
};

const isBlocked = async (ip, userId) => {
  const blocked = await BlockedEntity.findOne({
    deleted: false,
    $and: [
      {
        $or: [
          { type: "IP", value: ip },
          { type: "USER", value: userId ? userId.toString() : null },
        ],
      },
      {
        $or: [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ],
      },
    ],
  });
  return !!blocked;
};

module.exports = {
  init,
  logActivity,
  logAdminAction,
  createAlert,
  isBlocked,
};
