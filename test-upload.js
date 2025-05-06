// test-drive-upload.js
require('dotenv').config({ path: './.env.local' });
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.error('⚠️  Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY in .env.local');
  process.exit(1);
}

async function uploadTest() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });

  // Point this at any small local file you have:
  const filePath = path.join(__dirname, 'test.txt');
  if (!fs.existsSync(filePath)) {
    console.error('⚠️  File does not exist:', filePath);
    process.exit(1);
  }

  const folderId = '1AtV8QojulWcgoMtZczFtkAamCQaN7syK';

  console.log(`Uploading ${filePath} → folder ${folderId}…`);
  const stream = fs.createReadStream(filePath);

  try {
    const res = await drive.files.create({
      requestBody: {
        name: path.basename(filePath),
        parents: [folderId],
      },
      media: {
        mimeType: 'text/plain',
        body: stream,
      },
      fields: 'id,name,webViewLink',
    });
    console.log('Upload complete:', res.data);
  } catch (err) {
    console.error('Upload test failed:', err.message || err);
    process.exit(1);
  }
}

uploadTest();