// config/cloudinary.ts
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// رفع base64
export const uploadBase64ToCloudinary = async (base64: string, folder: string) => {
  const result = await cloudinary.uploader.upload(base64, { folder });
  return result.secure_url;
};

// رفع buffer (من multer)
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto', // عشان يقبل pdf و images وغيرهم
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    );

    uploadStream.end(buffer);
  });
};
