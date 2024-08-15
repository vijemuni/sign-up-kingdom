const nodemailer = require('nodemailer');

const createTransporter = async () => {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Your Gmail address
      pass: process.env.GMAIL_PASS  // Your Gmail app password
    },
  });

  return transporter;
};

const sendVerificationCode = async (email, code) => {
  try {
    const transporter = await createTransporter();

    const info = await transporter.sendMail({
      from: `"Papers Kingdom" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Password Reset Verification Code",
      text: `Your verification code is: ${code}`,
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { sendVerificationCode };
