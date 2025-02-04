import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';
import { handleApiError } from '@/utils/errorHandler';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const config = {
  api: {
    bodyParser: false, // Required for `formidable` to process files
  },
};

// Helper function to upload images with metadata
const uploadToCloudinary = (filePath: string, metadata: any): Promise<any> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'uploads',
        type: metadata.visibility === 'private' ? 'private' : 'upload',
        access_mode:
          metadata.visibility === 'private' ? 'authenticated' : 'public',
        context: {
          caption: metadata.title || '',
          alt: metadata.description || '',
        },
        tags: metadata.tags || [],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = new formidable.IncomingForm({
    multiples: true,
    uploadDir: '/tmp',
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return handleApiError(err, res, 'Error parsing form data');
    }

    const metadata = {
      visibility: fields.visibility?.toString() || 'public',
      title: fields.title?.toString() || '',
      description: fields.description?.toString() || '',
      tags: fields.tags ? fields.tags.toString().split(',') : [],
    };

    try {
      const uploadedFiles = Array.isArray(files.file)
        ? files.file
        : [files.file];
      const uploadResults = await Promise.all(
        uploadedFiles
          .map(async (file) => {
            if (file) {
              const result = await uploadToCloudinary(file.filepath, metadata);
              fs.unlinkSync(file.filepath); // Clean up temp file
              return result;
            }
          })
          .filter(Boolean)
      );

      return res.status(200).json({ success: true, images: uploadResults });
    } catch (error) {
      return handleApiError(error, res, 'Failed to upload images');
    }
  });
}
