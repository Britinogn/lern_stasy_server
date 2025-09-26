const express = require("express");
const router = express.Router();
const transporter = require("../config/nodemailer");

router.get("/test-email", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "" , // you can send it to yourself for testing
      subject: "Welcome to Lern Stasy 🎉",
      text: "Hi! This is a test email from Lern Stasy.",
      //html: "<h1>Welcome to Lern Stasy 🎉</h1><p>This is a test email!</p>",
    });

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
