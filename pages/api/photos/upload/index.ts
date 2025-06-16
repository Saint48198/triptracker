import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';
import formidable from 'formidable';
import fs from 'fs';
import sharp from 'sharp';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
  categorization: 'google',
  auto_tagging: 0.75,
});

export const config = {
  api: {
    bodyParser: false, // Required for `formidable` to process files
  },
};

// ✅ Function to optimize an image before upload
const optimizeImage = async (filePath: string, outputPath: string) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found for optimization.');
    }

    const metadata = await sharp(filePath).metadata();
    let format: keyof sharp.FormatEnum =
      metadata.format === 'png' ? 'png' : 'jpeg';
    let width = metadata.width && metadata.width > 2000 ? 2000 : undefined;

    await sharp(filePath)
      .resize(width)
      .toFormat(format, { quality: 80 })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Image optimization failed:', error);
    return filePath; // Return original file if optimization fails
  }
};

// ✅ Function to generate a signed URL for private images
const generateSignedUrl = (publicId: string): string => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    process.env.CLOUDINARY_API_SECRET as string
  );

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/authenticated/${publicId}?api_key=${process.env.CLOUDINARY_API_KEY}&timestamp=${timestamp}&signature=${signature}`;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = formidable({
      multiples: true,
      uploadDir: '/tmp',
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parsing error:', err);
        return res.status(500).json({ error: 'Error parsing form data' });
      }

      console.log('Parsed Fields:', fields);
      console.log('Parsed Files:', files);

      // ✅ Ensure files were received
      if (!files.files) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const uploadedFiles = Array.isArray(files.files)
        ? files.files
        : [files.files];

      const uploadResults = await Promise.all(
        uploadedFiles.map(async (file: formidable.File) => {
          const optimizedPath = `/tmp/optimized-${file.newFilename}`;
          const finalPath = await optimizeImage(file.filepath, optimizedPath);

          const visibility = Array.isArray(fields.visibility)
            ? fields.visibility[0]
            : fields.visibility;

          const tags = Array.isArray(fields.tags)
            ? fields.tags[0]
            : fields.tags;

          const result = await cloudinary.uploader.upload(finalPath, {
            folder: 'uploads',
            resource_type: 'image',
            type: visibility === 'private' ? 'private' : 'upload',
            access_mode: visibility === 'private' ? 'authenticated' : 'public',
            context: {
              caption: fields.title ? fields.title[0] : '',
              alt: fields.description ? fields.description[0] : '',
            },
            tags: tags ? tags.split(',') : [],
          });

          fs.unlinkSync(file.filepath); // Clean up temp file
          fs.unlinkSync(finalPath); // Remove optimized file

          return result;
        })
      );

      // ✅ Process result: Return public URL or signed URL
      const processedPhotos = uploadResults.map((photo) => {
        return {
          ...photo,
          url:
            photo.type === 'private'
              ? generateSignedUrl(photo.public_id)
              : photo.secure_url,
        };
      });

      return res.status(200).json({ success: true, images: processedPhotos });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Failed to upload images' });
  }
}
