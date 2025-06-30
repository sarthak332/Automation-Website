const { google } = require("googleapis");
const path = require("path");

// Import your downloaded JSON key file:
const credentials = require(path.join(__dirname, "./google-credentials.json"));

async function appendToGoogleSheet(values) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
   range: "ContactForm!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });

  console.log("Google Sheets append response:", response.data);
}

module.exports = appendToGoogleSheet;
async function appendToFileUploadSheet(values) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "FileUpload!A:D",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });

  console.log("Google Sheets append response (FileUpload):", response.data);
}

module.exports = { appendToGoogleSheet, appendToFileUploadSheet };

async function appendToBookingFormSheet(values) {
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: "BookingForm!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });

  console.log("Google Sheets append response (BookingForm):", response.data);
}

module.exports = { appendToGoogleSheet, appendToBookingFormSheet };

