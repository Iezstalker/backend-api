const nodemailer = require('nodemailer');

// Create a transporter using Mailtrap's SMTP settings
const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io', // Mailtrap's SMTP host
    port: 2525, // Mailtrap's SMTP port
    auth: {
        user: '84d3c6ca35005f', // your Mailtrap username
        pass: '4459b681a620da' // your Mailtrap password
    }
});

// Function to send email
const sendResetEmail = async (email, resetUrl) => {
    const mailOptions = {
        from: '<noreply@yourapp.com>', // Sender address
        to: email, // List of receivers
        subject: 'Password Reset', // Subject line
        text: `To reset your password, please click on this link: ${resetUrl}`, // Plain text body
        html: `<p>To reset your password, please click on this link: <a href="${resetUrl}">${resetUrl}</a></p>` // HTML body
    };
    // Send email
    try {
        await transporter.sendMail(mailOptions);
        console.log('Reset password email sent');
    } catch (error) {
        console.error('There was an error sending the email', error);
    }
};

module.exports = { sendResetEmail };