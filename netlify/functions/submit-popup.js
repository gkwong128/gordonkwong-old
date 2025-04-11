// netlify/functions/submit-popup.js
const { google } = require('googleapis');
// ADD Mailjet require statement
const Mailjet = require('node-mailjet');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming data (name and email from the frontend)
    const { name, email } = JSON.parse(event.body);

    if (!name || !email) {
      return { statusCode: 400, body: 'Missing name or email' };
    }

    // --- Google Sheets API Integration ---
    // ... (Keep your existing Google Sheets logic here - authentication, append request) ...
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'THYS emails';
    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });
    const valuesToAppend = [[new Date().toISOString(), name, email]];
    const request = {
      spreadsheetId: sheetId,
      range: `${sheetName}!A:C`,
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: valuesToAppend },
    };
    const sheetsResponse = await sheets.spreadsheets.values.append(request);
    console.log('Google Sheets API response:', sheetsResponse.data);
    // --- End Google Sheets API Integration ---


    // --- Send Coupon Email using Mailjet ---
    const mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY
    );

    const couponCode = "THEORANGECOMPANY"; // Define your coupon code

    const mailjetRequest = mailjet
        .post("send", { 'version': 'v3.1' })
        .request({
            "Messages": [
                {
                    "From": {
                        "Email": "gordon@gordonkwong.com", // CHANGE to your verified Mailjet sender email
                        "Name": "Gordon" // Optional: Sender Name
                    },
                    "To": [
                        {
                            "Email": email, // User's submitted email
                            "Name": name    // User's submitted name (optional)
                        }
                    ],
                    "Subject": "Your Coupon Code!",
                    "TextPart": `Hi ${name},\n\nThanks for your interest! Here is your coupon code: ${couponCode}`,
                    "HTMLPart": `<h3>Hi ${name},</h3><p>Thanks for your interest! Here is your coupon code: <strong>${couponCode}</strong></p>`
                }
            ]
        });

    try {
        const result = await mailjetRequest;
        console.log('Mailjet Send API Response:', result.body);
    } catch (emailError) {
        console.error('Error sending Mailjet email:', emailError.statusCode, emailError.message);
         // Decide if you want to return an error to the user if email fails
         // For now, we just log it and proceed to return success for the sheet part.
    }
    // --- End Send Coupon Email ---


    // Return success response to the frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data successfully submitted!' }),
    };

  } catch (error) {
    // ... (Keep your existing main catch block for Sheets errors etc.) ...
    console.error('Error processing request:', error);
    if (error.response && error.response.data) {
        console.error('Google API Error:', error.response.data.error);
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process submission. Check function logs.' }),
    };
  }
};