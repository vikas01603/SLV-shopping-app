const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const SecurityLog = require("./models/SecurityLog");
const SecurityAlert = require("./models/SecurityAlert");
const AdminAuditLog = require("./models/AdminAuditLog");

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const logsCount = await SecurityLog.countDocuments();
    const alertsCount = await SecurityAlert.countDocuments();
    const auditCount = await AdminAuditLog.countDocuments();

    console.log(`Security Logs: ${logsCount}`);
    console.log(`Security Alerts: ${alertsCount}`);
    console.log(`Admin Audit Logs: ${auditCount}`);

    if (logsCount > 0) {
        const lastLog = await SecurityLog.findOne().sort({ timestamp: -1 });
        console.log("Last Log:", JSON.stringify(lastLog, null, 2));
    }

    mongoose.disconnect();
  } catch (error) {
    console.error("DB check failed:", error);
    process.exit(1);
  }
};

checkDB();
