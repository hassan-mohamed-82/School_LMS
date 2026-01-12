import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


export default cloudinary;

export const uploadBase64ToCloudinary = async (base64: string, folder: string) => {
  const result = await cloudinary.uploader.upload(base64, { folder });
  return result.secure_url;
};
