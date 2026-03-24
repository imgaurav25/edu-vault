const nodemailer = require("nodemailer");

async function sendContactMail({ fullName, email, phone, subject, message }) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"EduVault Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to your email
      subject: `📩 New Contact Message: ${subject}`,
      html: `
            <h2>📬 New Contact Form Submission</h2>
            <p><b>Name:</b> ${fullName}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Phone:</b> ${phone}</p>
            <p><b>Message:</b><br/> ${message}</p>
            <hr/>
            <p>📌 From EduVault Contact Page</p>
        `,
    });

    console.log("📨 Contact mail sent successfully!");
    return true;
  } catch (error) {
    console.log("❌ Mail Send Error:", error);
    return false;
  }
}

module.exports = sendContactMail;
