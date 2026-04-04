const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const SecurityLog = require("./models/SecurityLog");

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
        const logins = await SecurityLog.countDocuments({ action: "POST /api/users/login", status: "SUCCESS" });
        const allLogs = await SecurityLog.find().limit(10).sort({ timestamp: -1 });
        
        console.log(`Logins found: ${logins}`);
        console.log("Recent log actions:");
        allLogs.forEach(l => console.log(`- ${l.action} [${l.status}] at ${l.timestamp}`));
        
        mongoose.disconnect();
    } catch (e) {
        console.error(e);
    }
};
checkData();
