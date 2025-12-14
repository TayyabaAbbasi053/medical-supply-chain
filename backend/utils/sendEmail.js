const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendOTP(email, otp) {
    const mailOptions = {
        from: `"SupplyChain Secure" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Login OTP",
        html: `
            <h2>Your OTP Code</h2>
            <p>Your verification code is:</p>
            <h1>${otp}</h1>
            <p>This OTP expires in 5 minutes.</p>
        `
    };

    await transporter.sendMail(mailOptions);
}

async function sendEmail(email, subject, htmlBody) {
    const mailOptions = {
        from: `"Medical Supply Chain" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: htmlBody
    };

    await transporter.sendMail(mailOptions);
}

module.exports = { sendOTP, sendEmail };
