const sendEmail = async (options) => {
    // We are using a 100% FREE Google Apps Script endpoint to send emails.
    // This completely bypasses Render's SMTP block because it's a standard HTTPS request,
    // and it uses your exact own Gmail account without any third-party app!
    
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
        throw new Error("Missing GOOGLE_SCRIPT_URL. Please follow the Apps Script setup instructions.");
    }

    const payload = {
        to: options.email,
        subject: options.subject,
        message: options.message,
    };

    const response = await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Google Script failed to send: ${response.statusText}`);
    }
};

module.exports = sendEmail;
