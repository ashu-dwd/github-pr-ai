import nodemailer from "nodemailer";
import { marked } from "marked";
import fs from "fs";
import {
  GMAIL_RECIEVERS,
  GMAIL_USER_EMAIL,
  GMAIL_USER_PASSWORD,
} from "../config.js";

// Gmail SMTP transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // Windows + Gmail ke liye simple config
  auth: {
    user: GMAIL_USER_EMAIL,
    pass: GMAIL_USER_PASSWORD, // App Password use karo, normal password nahi chalega
  },
});

// Send Email function
export const sendEmail = async (peerReview) => {
  try {
    const info = await transporter.sendMail({
      from: `"CodeSentinel" <${GMAIL_USER_EMAIL}>`,
      to: GMAIL_RECIEVERS,
      subject: "Peer Review of Latest Commit",
      html: marked(peerReview), // Markdown ko HTML me convert karke bhej raha
    });

    //console.log("✅ Email sent:", info);
    return true;
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    return false;
  }
};

// Read file & send
// const peerReview = fs.readFileSync("reviews/review_Sat-Aug-16-2025.md", "utf8");
// await sendEmail(peerReview);
