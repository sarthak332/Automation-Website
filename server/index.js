const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const FormData = require("form-data");
const { OpenAI } = require("openai");
const PDFDocument = require("pdfkit");
const Razorpay = require("razorpay");
require("dotenv").config();

const { google } = require("googleapis");
const credentials = require("./google-credentials.json");
const { appendToBookingFormSheet } = require("./googleSheets");

const app = express();
app.use(cors());
app.use(express.json());

// Multer storage
const upload = multer({ dest: "uploads/" });

/** ✅ Helper: append to ContactForm sheet */
async function appendToContactFormSheet(values) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "ContactForm!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });

  console.log("✅ Data saved to Google Sheets (ContactForm)!");
}

/** ✅ Helper: append to FileUpload sheet */
async function appendToFileUploadSheet(values) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "FileUpload!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });

  console.log("✅ Data saved to Google Sheets (FileUpload)!");
}

// -------------------------------
// ✅ Contact Form Route
// -------------------------------
app.post("/api/send-email", async (req, res) => {
  const { name, email, message, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ error: "reCAPTCHA token missing." });
  }

  try {
    // ✅ ReCAPTCHA verification
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify`;
    const params = new URLSearchParams();
    params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
    params.append("response", recaptchaToken);

    const response = await axios.post(verifyURL, params);
    if (!response.data.success || response.data.score < 0.5) {
      return res.status(400).json({ error: "Failed reCAPTCHA verification." });
    }

    console.log("✅ reCAPTCHA verified.");

    // ✅ Generate PDF receipt
    const pdfPath = path.join(
      __dirname,
      `uploads/${Date.now()}-contact-receipt.pdf`
    );
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);
    doc.fontSize(16).text("Contact Form Submission Receipt", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Message: ${message}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    console.log("✅ PDF receipt generated.");

    // ✅ Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("✅ Sending email to owner...");

    // ✅ Email to owner
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Message from ${name}`,
      text: message,
      attachments: [
        {
          filename: "ContactReceipt.pdf",
          path: pdfPath,
        },
      ],
    });

    console.log("✅ Sending autoresponder...");

    // ✅ Auto-responder to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thanks for contacting us!",
      text: `Hi ${name},\n\nThanks for reaching out. We’ve received your message and will reply shortly.\n\nBest regards,\nAutomation Website Team`,
      attachments: [
        {
          filename: "ContactReceipt.pdf",
          path: pdfPath,
        },
      ],
    });

    console.log("✅ Saving to Google Sheets...");

    // ✅ Save to Google Sheets
    await appendToContactFormSheet([
      name,
      email,
      message,
      new Date().toISOString(),
    ]);

    console.log("✅ Sending Telegram message...");

    // ✅ Send Telegram message
    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await axios.post(
      telegramApiUrl,
      {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `💬 *New Contact Form Submission*\n\n👤 Name: ${name}\n✉️ Email: ${email}\n📝 Message: ${message}`,
        parse_mode: "Markdown",
      },
      {
        timeout: 10000,
      }
    );

    console.log("✅ Cleaning up PDF file...");
    fs.unlink(pdfPath, (err) => {
      if (err) console.error("Failed to delete PDF file:", err);
    });

    res.status(200).json({
      message: "Email, Telegram, and PDF sent successfully!",
    });
  } catch (error) {
    console.error(
      "Backend error in contact form:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error sending email or Telegram." });
  }
});

// -------------------------------
// ✅ File Upload Route
// -------------------------------
app.post("/api/upload-file", upload.single("file"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    // ✅ Generate PDF receipt
    const uploadsDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }

    const pdfFilename = `${Date.now()}-upload-receipt.pdf`;
    const pdfPath = path.join(uploadsDir, pdfFilename);

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(16).text("File Upload Confirmation", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Uploaded File: ${file.originalname}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // ✅ Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Email owner
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: `New File Upload from ${name}`,
      text: `A user has uploaded a file.\n\nName: ${name}\nEmail: ${email}`,
      attachments: [
        {
          filename: file.originalname,
          path: file.path,
        },
        {
          filename: "UploadReceipt.pdf",
          path: pdfPath,
        },
      ],
    });

    console.log("✅ Owner email sent!");

    // ✅ Email user receipt
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thanks for uploading your file!",
      text: `Hi ${name},\n\nThanks for uploading your file. Please find your receipt attached.\n\nBest regards,\nAutomation Website Team`,
      attachments: [
        {
          filename: "UploadReceipt.pdf",
          path: pdfPath,
        },
      ],
    });

    console.log("✅ User email sent!");

    // ✅ Save upload info to Google Sheets
    await appendToFileUploadSheet([
      new Date().toISOString(),
      name,
      email,
      `Uploaded file: ${file.originalname}`,
    ]);

    // ✅ Send Telegram file preview
    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendDocument`;
    const formData = new FormData();
    formData.append("chat_id", process.env.TELEGRAM_CHAT_ID);
    formData.append(
      "caption",
      `⚡ New File Upload:\n\nName: ${name}\nEmail: ${email}\nFile: ${file.originalname}`
    );
    formData.append("document", fs.createReadStream(file.path));

    await axios.post(telegramApiUrl, formData, {
      headers: formData.getHeaders(),
      timeout: 60000,
    });

    console.log("✅ Telegram message sent!");

    // ✅ Clean up local files
    fs.unlink(file.path, (err) => {
      if (err) console.error("Failed to delete uploaded file:", err);
    });
    fs.unlink(pdfPath, (err) => {
      if (err) console.error("Failed to delete PDF file:", err);
    });

    res.json({
      message: "File uploaded, PDF receipts sent via email, Telegram notified!",
    });
  } catch (error) {
    console.error(
      "File upload error:",
      error.response?.data || error.message
    );
    res.status(500).json({
      error: "Error uploading file or sending notifications.",
    });
  }
});

// -------------------------------
// ✅ OpenAI Chatbot Route
// -------------------------------
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful chatbot for an automation website.",
        },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error talking to OpenAI." });
  }
});

// -------------------------------
// ✅ Booking Calendar Route
// -------------------------------
app.post("/api/book", async (req, res) => {
  try {
    const { name, email, date, time } = req.body;

    const pdfPath = path.join(
      __dirname,
      `uploads/${Date.now()}-booking-receipt.pdf`
    );
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);

    doc.pipe(writeStream);
    doc.fontSize(18).text("Booking Confirmation Receipt", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Booking Date: ${date}`);
    doc.text(`Time: ${time}`);
    doc.text(`Submitted At: ${new Date().toLocaleString()}`);
    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    await appendToBookingFormSheet([
      new Date().toISOString(),
      name,
      email,
      `Booking Date: ${date}, Time: ${time}`,
    ]);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Booking from ${name}`,
      text: `A new booking was submitted:\n\nName: ${name}\nEmail: ${email}\nDate: ${date}\nTime: ${time}`,
      attachments: [
        {
          filename: "BookingReceipt.pdf",
          path: pdfPath,
        },
      ],
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmed!",
      text: `Hi ${name},\n\nYour booking has been confirmed.\nDate: ${date}\nTime: ${time}\n\nYour receipt is attached.\n\n– Automation Website Team`,
      attachments: [
        {
          filename: "BookingReceipt.pdf",
          path: pdfPath,
        },
      ],
    });

    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    await axios.post(telegramApiUrl, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: `📅 *New Booking Received*\n\n👤 Name: ${name}\n✉️ Email: ${email}\n📆 Date: ${date}\n⏰ Time: ${time}`,
      parse_mode: "Markdown",
    });

    fs.unlink(pdfPath, (err) => {
      if (err) console.error("Failed to delete PDF file:", err);
    });

    res.json({ message: "Booking submitted successfully with receipt!" });
  } catch (error) {
    console.error("Booking error:", error.response?.data || error.message);
    res.status(500).json({ error: "Error submitting booking." });
  }
});

// -------------------------------
// ✅ Razorpay Integration
// -------------------------------
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency, name, email } = req.body;

    const options = {
      amount: amount * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name,
      email,
    });
  } catch (error) {
    console.error("Razorpay create order error:", error.message);
    res.status(500).json({ error: "Error creating order." });
  }
});

app.post("/api/payment-success", async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      name,
      email,
      amount,
    } = req.body;

    const pdfPath = path.join(
      __dirname,
      `uploads/${Date.now()}-payment-receipt.pdf`
    );

    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    doc.pipe(writeStream);

    doc.fontSize(18).text("Payment Receipt", { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${name}`);
    doc.text(`Email: ${email}`);
    doc.text(`Order ID: ${razorpay_order_id}`);
    doc.text(`Payment ID: ${razorpay_payment_id}`);
    doc.text(`Amount Paid: ₹${(amount / 100).toFixed(2)}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Payment Receipt - Automation Website",
      text: `Hi ${name},\n\nThanks for your payment. Your receipt is attached.\n\nBest regards,\nAutomation Website Team`,
      attachments: [
        {
          filename: "PaymentReceipt.pdf",
          path: pdfPath,
        },
      ],
    });

    fs.unlink(pdfPath, (err) => {
      if (err) console.error("Failed to delete PDF file:", err);
    });

    res.json({ message: "Payment verified and receipt sent!" });
  } catch (error) {
    console.error(
      "Payment success error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error handling payment success." });
  }
});

// -------------------------------
// ✅ Telegram Test Route
// -------------------------------
app.post("/api/send-telegram", async (req, res) => {
  const { message } = req.body;

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const response = await axios.post(telegramApiUrl, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message,
    });

    if (response.data.ok) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: "Telegram API error" });
    }
  } catch (error) {
    console.error(
      "Telegram error:",
      error.response?.data || error.message
    );
    res
      .status(500)
      .json({ success: false, error: "Error sending Telegram message." });
  }
});

// -------------------------------
// ✅ Start the server
// -------------------------------
app.listen(5000, () => {
  console.log("✅ Server started on port 5000");
});
