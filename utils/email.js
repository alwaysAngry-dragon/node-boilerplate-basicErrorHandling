const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or another email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const transporterSendGrid = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    apiKey: process.env.SENDGRID_API_KEY,
  },
});

// set up the mail options
const resetUrl = `http://yourfrontend.com/reset-password?token=${token}`;
const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: 'Password Reset Request',
  html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p>`,
};

// Send email with reset link

try {
  await transporter.sendMail(mailOptions);
  res.json({ message: 'Password reset email sent' });
} catch (error) {
  res
    .status(500)
    .json({ message: 'Error sending email', error });
}
