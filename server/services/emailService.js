const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASSWORD,
  },
});

exports.sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: config.EMAIL_FROM,
      to: email,
      subject: "Welcome to Our App!",
      html: `
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for registering with us.</p>
        <p>We're excited to have you on board!</p>
      `,
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};
