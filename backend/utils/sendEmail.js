const sendEmail = async (options) => {
    // We are using the Brevo (Sendinblue) REST API to completely bypass 
    // Render's SMTP port 587 block. This sends via standard HTTPS (Port 443).
    
    const url = 'https://api.brevo.com/v3/smtp/email';
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
        throw new Error("Missing BREVO_API_KEY in environment variables. Please add it to Render and your local .env file.");
    }

    const payload = {
        sender: {
            name: "SLV Support",
            email: process.env.EMAIL_USER || "support.slvfashion@gmail.com"
        },
        to: [
            {
                email: options.email,
            }
        ],
        subject: options.subject,
        textContent: options.message,
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'api-key': apiKey,
            'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        let errorMsg = response.statusText;
        try {
            const errorData = await response.json();
            errorMsg = JSON.stringify(errorData);
        } catch (e) {}
        throw new Error(`Email API failed to send: ${errorMsg}`);
    }
};

module.exports = sendEmail;
