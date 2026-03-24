const nodemailer = require("nodemailer");

module.exports = async (email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // ✅ URL PARAM (NOT QUERY PARAM)
    const resetLink = `https://eduvault.vercel.app/api/reset-password/${token}`;


    await transporter.sendMail({
      from: `"EduVault Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "EduVault Password Reset",
      html: `
        <h3>Password Reset</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `
    });

    console.log("✅ Reset email sent to:", email);
  } catch (err) {
    console.error("❌ Reset email error:", err.message);
    throw err;
  }
};
