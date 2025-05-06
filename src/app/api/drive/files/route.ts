import { NextResponse, NextRequest } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Force Node.js runtime
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  console.log('=== /api/drive/files called ===');
  console.log('ENV GOOGLE_CLIENT_EMAIL:', process.env.GOOGLE_CLIENT_EMAIL);
  console.log('ENV GOOGLE_PRIVATE_KEY (first 30 chars):',
    process.env.GOOGLE_PRIVATE_KEY?.substring(0, 30).replace(/\n/g, '\\n') + '...'
  );
  console.log('ENV GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!folderId) {
    console.error('Missing GOOGLE_DRIVE_FOLDER_ID');
    return NextResponse.json({ error: 'Folder ID not configured' }, { status: 500 });
  }

  try {
    const jwtClient = new JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL!,
      key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
    console.log('JWT client created');
    const drive = google.drive({ version: 'v3', auth: jwtClient });

    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, webViewLink)',
      orderBy: 'createdTime desc',
    });

    console.log('Drive API response files:', response.data.files);
    return NextResponse.json({ files: response.data.files || [] });
  } catch (err: any) {
    console.error('Drive API error:', err);
    return NextResponse.json({ error: err.message || 'Drive API error' }, { status: 500 });
  }
}