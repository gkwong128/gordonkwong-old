// netlify/functions/subscribe-newsletter.js
const { google } = require('googleapis');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming data (only email expected from footer form)
    const { email } = JSON.parse(event.body);

    if (!email || !/\S+@\S+\.\S+/.test(email)) { // Basic email validation
      return { statusCode: 400, body: 'Missing or invalid email' };
    }

    // --- Google Sheets API Setup ---
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'THYS emails'; // Target Sheet Name
    const emailColumn = 'C'; // Assuming Email is in Column C
    const fullEmailRange = `${sheetName}!${emailColumn}:${emailColumn}`; // Read entire C column

    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    // --- Check if Email Exists ---
    let existingRowIndex = -1;
    try {
      // *** This is the .get call you were missing ***
      const getResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: fullEmailRange,
      });

      const existingEmails = getResponse.data.values;
      if (existingEmails && existingEmails.length > 0) {
        // Find the index (row number - 1) of the email, if it exists
        existingRowIndex = existingEmails.findIndex(row => row[0] && row[0].toLowerCase() === email.toLowerCase());
      }
    } catch (err) {
      // Handle cases where the sheet might be empty or range not found initially
      if (err.code === 400 && err.message.includes('Unable to parse range')) {
         console.log('Sheet or range likely empty, proceeding to append.');
         existingRowIndex = -1; // Treat as not found
      } else {
        console.error('Error reading sheet:', err);
        throw new Error('Could not check existing emails.'); // Throw error to be caught below
      }
    }

    // --- Conditional Action ---
    if (existingRowIndex !== -1) {
      // Email WAS found
      console.log('Email already subscribed (footer):', email);
      return {
        statusCode: 200, // Return success, but indicate already subscribed
        body: JSON.stringify({ message: 'Email is already subscribed.' }),
      };
    } else {
      // Email NOT found, append new row
      const valuesToAppend = [
        [new Date().toISOString(), "", email], // Timestamp (A), Name (B, blank), Email (C)
      ];
      const appendRequest = {
        spreadsheetId: sheetId,
        range: `${sheetName}!A:C`, // Append to columns A:C
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: valuesToAppend },
      };
      await sheets.spreadsheets.values.append(appendRequest);
      console.log('Newsletter subscription added to sheet for:', email);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Successfully subscribed!' }),
      };
    }

  } catch (error) {
    console.error('Error processing newsletter subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Subscription failed. Please try again later.' }),
    };
  }
};