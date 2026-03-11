const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1) Create a transporter
    // Using Gmail service explicitly for better compatibility
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false 
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: `"SLV Support" <${process.env.EMAIL_USER}>`, // Must match authenticated user
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
