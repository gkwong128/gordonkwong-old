// netlify/functions/submit-popup.js
const { google } = require('googleapis');
const Mailjet = require('node-mailjet'); // Assuming Mailjet is still used here

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse the incoming data (name and email from the frontend)
    const { name, email, flowType } = JSON.parse(event.body);

    if (!name || !email || !/\S+@\S+\.\S+/.test(email)) { // Basic validation
      return { statusCode: 400, body: 'Missing name or invalid email' };
    }

    // --- Google Sheets API Setup ---
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
    const sheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'THYS emails'; // Your specific sheet tab name
    const nameColumn = 'B'; // Assuming Name is in Column B
    const emailColumn = 'C'; // Assuming Email is in Column C
    const fullEmailRange = `${sheetName}!${emailColumn}:${emailColumn}`; // Range to read emails

    const auth = new google.auth.GoogleAuth({ credentials, scopes: ['https://www.googleapis.com/auth/spreadsheets'] });
    const sheets = google.sheets({ version: 'v4', auth });

    // --- Check if Email Exists ---
    let existingRowIndex = -1;
    try {
        // *** This is the .get call you were missing ***
        const getResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: fullEmailRange, // Read Column C
        });

        const existingEmails = getResponse.data.values;
        if (existingEmails && existingEmails.length > 0) {
            // Find the index (row number - 1) of the email
            existingRowIndex = existingEmails.findIndex(row => row[0] && row[0].toLowerCase() === email.toLowerCase());
        }
    } catch (err) {
        // Handle cases where the sheet/range might be empty
        if (err.code === 400 && err.message.includes('Unable to parse range')) {
             console.log('Sheet or email column likely empty, proceeding to append.');
             existingRowIndex = -1; // Treat as not found
        } else {
            console.error('Error reading sheet:', err);
            throw new Error('Could not check existing emails.'); // Throw error to main catch
        }
    }

    // --- Conditional Action: Update or Append ---
    let sheetsResponseData;
    if (existingRowIndex !== -1) {
      // Email WAS found, update the name in the existing row
      const rowNumber = existingRowIndex + 1; // Sheet rows are 1-indexed
      const updateRange = `${sheetName}!${nameColumn}${rowNumber}`; // e.g., 'THYS emails'!B5
      console.log(`Email found at row ${rowNumber}, updating name in range: ${updateRange}`);

      const updateRequest = {
        spreadsheetId: sheetId,
        range: updateRange,
        valueInputOption: 'USER_ENTERED', // Interpret input as if user typed it
        requestBody: {
          // The data structure for update is slightly different than append
          // It expects a 2D array for the specified range.
          values: [[name]], // Update only the name cell in the found row
        },
      };
      // *** This is the .update call ***
      const updateResponse = await sheets.spreadsheets.values.update(updateRequest);
      sheetsResponseData = updateResponse.data;
      console.log('Google Sheets name update response:', sheetsResponseData);

    } else {
      // Email NOT found, append a new row
      const valuesToAppend = [
        [new Date().toISOString(), name, email], // Timestamp (A), Name (B), Email (C)
      ];
      const appendRequest = {
        spreadsheetId: sheetId,
        range: `${sheetName}!A:C`, // Append to columns A, B, C
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: valuesToAppend },
      };
      // *** This is the .append call ***
      const appendResponse = await sheets.spreadsheets.values.append(appendRequest);
      sheetsResponseData = appendResponse.data;
      console.log('Google Sheets new row append response:', sheetsResponseData);
    }
    // --- End Conditional Action ---


    // Determine Mailjet email content based on flowType
    let subject, textPart, htmlPart;
    if (flowType === 'download') {
      subject = "Here’s Your Product Guide";
      textPart = `Hi ${name},\n\nThank you for downloading our Product Guide. You can access it here:\n\nhttps://${process.env.SITE_DOMAIN}/productguide.pdf\n\nEnjoy!`;
      htmlPart = `
 <!DOCTYPE html>
 <html lang="en"><body style="font-family:Manrope, sans-serif; color:#333; margin:0; padding:2rem;">
   <h2>Hello ${name},</h2>
   <p>Thank you for downloading our <strong>Product Guide</strong>. Click below to view it:</p>
   <p style="text-align:center;">
     <a href="https://${process.env.SITE_DOMAIN}/productguide.pdf"
        style="display:inline-block;padding:0.75rem 1.5rem;background:#000;color:#fff;text-decoration:none;border-radius:4px;">
       View Product Guide
     </a>
   </p>
 </body></html>`;
    } else {
      subject = "Thanks for joining the THYS waitlist!";
      textPart = `Hello ${name},\n\nThank you for joining our waitlist! We’ll keep you updated with exclusive news and early access to THYS.`;
      htmlPart = `
 <!DOCTYPE html>
 <html lang="en"><body style="font-family:Manrope, sans-serif; color:#333; margin:0; padding:2rem;">
   <div style="background:#000; text-align:center; padding:2rem;">
     <img src="https://www.gordonkwong.com/logo-inverted.png" alt="THYS Logo" style="max-width:200px;">
   </div>
   <div style="padding:2rem; text-align:center;">
     <h1 style="font-family:Italiana, serif; margin-bottom:0.5rem;">EXPERIENCE INNOVATION</h1>
     <p>Hello ${name},<br><br>
       Thank you for joining our waitlist! You will be the first to be notified about product updates and early access to THYS.</p>
     <p>You will not regret THYS! Please stay tuned.</p>
   </div>
   <div style="background:#f5f5f5; padding:1.5rem; text-align:center;">
     <a href="https://www.instagram.com/gordonkwongphotos/" style="margin:0 0.25rem;">
       <img src="https://www.gordonkwong.com/instagramicon.png" alt="Instagram" style="width:32px;"/>
     </a>
     <p>gordon@gordonkwong.com</p>
   </div>
 </body></html>`;
    }

    // --- Send Waitlist Confirmation Email using Mailjet ---
    const mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY
    );
    const mailjetRequest = mailjet
      .post("send", { version: 'v3.1' })
      .request({
        "Messages": [
          {
            "From": {
              "Email": "gordon@gordonkwong.com",
              "Name": "Gordon"
            },
            "To": [ { "Email": email, "Name": name } ],
            "Subject": subject,
            "TextPart": textPart,
            "HTMLPart": htmlPart
          }
        ]
      });

    try {
        const result = await mailjetRequest;
        console.log('Mailjet Send API Response:', result.body);
    } catch (emailError) {
        console.error('Error sending Mailjet email:', emailError.statusCode, emailError.message);
        // Log only, don't cause function to fail if email sending fails
    }
    // --- End Send Waitlist Confirmation Email ---

    // Return success response to the frontend (indicates sheet operation was successful)
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Data successfully processed!' }),
    };

  } catch (error) {
    console.error('Error processing popup submission:', error);
    if (error.response && error.response.data) {
        console.error('Google API Error:', error.response.data.error);
    }
    // Return generic error response
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to process submission. Check function logs.' }),
    };
  }
};