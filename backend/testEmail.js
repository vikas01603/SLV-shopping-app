require('dotenv').config();
const sendEmail = require('./utils/sendEmail');

(async () => {
  try {
    console.log("Attempting to send an email...");
    await sendEmail({
      email: "support.slvfashion@gmail.com",
      subject: "Test Email from SLV Shopping App",
      message: "This is a test email to verify Nodemailer credentials."
    });
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email.");
    console.error("Error Message:", error.message);
    console.error("Full Error:", error);
  }
})();
