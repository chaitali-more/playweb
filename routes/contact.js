const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const axios = require("axios");


require("dotenv").config();

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

router.post("/contactform", async (req, res) => {
  const { name, phone, email, message, token } = req.body;

  // Check for required fields
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, Email, and Message are required." });
  }

  // Verify reCAPTCHA token
  try {
    const verifyResponse = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );

    // If reCAPTCHA verification fails
    if (!verifyResponse.data.success) {
      return res.status(400).json({ message: "reCAPTCHA verification failed. Please try again." });
    }

    // If reCAPTCHA verification passes, proceed with email logic
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.SMTP_PASS,
      },
      pool: false, // Disable pooling
      maxConnections: 1, // Single connection

    });

// Admin Email
const adminMailOptions = {
  from: process.env.ADMIN_EMAIL,
  to: process.env.ADMIN_EMAIL,
  subject: "Yeah New Contact Form Submission",
  html: `
    <h3>New Contact Form Submission</h3>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong> ${message}</p>
  `,
  headers: { 'X-Unique-Message-ID': Date.now().toString() }, // Unique header
};

// User Confirmation Email
const userMailOptions = {
  from: process.env.ADMIN_EMAIL,
  to: email,
  subject: `Thank You for Contacting Us, ${name}!`, // Fixed subject
  html: `
    <h3>Thank You, ${name}!</h3>
    <p>Hey, We have received your message and will get back to you shortly.</p>
    <p><strong>Your Submission:</strong></p>
    <p><strong>Phone:</strong> ${phone || "N/A"}</p>
    <p><strong>Email:</strong> ${email}</p> <!-- Added email -->
    <p><strong>Message:</strong> ${message}</p>
    <p>Best regards,</p>
    <p>Playweb Technologies Pvt. Ltd.</p>
  `,
  headers: { 'X-Unique-Message-ID': Date.now().toString() }, // Unique header
};

    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions),
     

    ]);

    res.status(200).json({ message: "Form submitted successfully!" });
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
