// test-drive-list.js
require('dotenv').config({ path: './.env.local' });
const { google } = require('googleapis');

if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.error('⚠️  Missing GOOGLE_CLIENT_EMAIL or GOOGLE_PRIVATE_KEY in .env.local');
  process.exit(1);
}

async function listTest() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  });
  const drive = google.drive({ version: 'v3', auth });
  const folderId = '1AtV8QojulWcgoMtZczFtkAamCQaN7syK'; // your folder ID

  console.log(`Listing files in folder ${folderId}…`);
  try {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink)',
      orderBy: 'createdTime desc',
    });
    console.log('Found files:', res.data.files);
  } catch (err) {
    console.error('List test failed:', err.message || err);
    process.exit(1);
  }
}

listTest();