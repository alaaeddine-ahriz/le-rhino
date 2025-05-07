import type { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm, File as FormidableFile, Fields, Files } from 'formidable';
import fs from 'fs';
import { uploadFileToDrive } from '@/lib/googleDriveService';

// Disable default body parsing, since we use formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const form = new IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields: Fields, files: Files) => {
    if (err) {
      console.error('Form parse error:', err);
      return res.status(500).json({ error: 'Error parsing form data' });
    }

    const fileField = files.file as FormidableFile | FormidableFile[];
    if (!fileField) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploaded = Array.isArray(fileField) ? fileField[0] : fileField;
    const filePath = uploaded.filepath;
    const filename = uploaded.originalFilename || uploaded.newFilename!;
    const mimeType = uploaded.mimetype || 'application/octet-stream';

    // For streaming, we can pass fs.createReadStream
    const stream = fs.createReadStream(filePath);

    try {
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;
      const result = await uploadFileToDrive(stream, filename, mimeType, folderId);

      // Clean up temp file
      fs.unlinkSync(filePath);

      return res.status(200).json({ file: result });
    } catch (uploadError: unknown) {
      console.error('Upload to Drive failed:', uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Upload failed';
      return res.status(500).json({ error: errorMessage });
    }
  });
} 