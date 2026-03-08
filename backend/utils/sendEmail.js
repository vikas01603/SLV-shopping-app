const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    // 1) Create a transporter
    // For production, you'd use a real service like SendGrid, Mailgun, or Gmail
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
        port: process.env.EMAIL_PORT || 2525,
        auth: {
            user: process.env.EMAIL_USER || "placeholder_user",
            pass: process.env.EMAIL_PASS || "placeholder_pass",
        },
    });

    // 2) Define the email options
    const mailOptions = {
        from: '"SLV Support" <support@slv.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html: 
    };

    // 3) Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
