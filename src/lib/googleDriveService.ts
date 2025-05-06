import { GoogleAuth } from 'google-auth-library';
import { google, drive_v3 } from 'googleapis';
import { ReadStream } from 'fs';

// Initialize GoogleAuth with service account credentials
const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL!,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

// Create Drive API client
const drive = google.drive({ version: 'v3', auth });

/**
 * List files in a Google Drive folder
 */
export async function listFilesInFolder(folderId: string): Promise<drive_v3.Schema$File[]> {
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: 'files(id, name, mimeType, webViewLink, thumbnailLink, createdTime, size)',
    orderBy: 'createdTime desc',
  });
  return response.data.files || [];
}

/**
 * Upload a file to Google Drive using a Buffer or ReadStream
 */
export async function uploadFileToDrive(
  body: Buffer | ReadStream,
  filename: string,
  mimeType: string,
  folderId: string
): Promise<drive_v3.Schema$File> {
  const response = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body },
    fields: 'id,name,webViewLink,mimeType,size,createdTime',
  });
  return response.data;
}

// Get file details
export const getFileDetails = async (fileId: string) => {
  try {
    const authClient = auth;
    const drive = google.drive({ version: 'v3', auth: authClient });
    
    const response = await drive.files.get({
      fileId,
      fields: 'id,name,mimeType,webViewLink,thumbnailLink,createdTime,size'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting file details from Google Drive:', error);
    throw error;
  }
}; 