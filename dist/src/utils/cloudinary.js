"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadBufferToCloudinary = exports.uploadBase64ToCloudinary = void 0;
// config/cloudinary.ts
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.default = cloudinary_1.v2;
// رفع base64
const uploadBase64ToCloudinary = async (base64, folder) => {
    const result = await cloudinary_1.v2.uploader.upload(base64, { folder });
    return result.secure_url;
};
exports.uploadBase64ToCloudinary = uploadBase64ToCloudinary;
// رفع buffer (من multer)
const uploadBufferToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            folder,
            resource_type: 'auto', // عشان يقبل pdf و images وغيرهم
        }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result.secure_url);
            }
        });
        uploadStream.end(buffer);
    });
};
exports.uploadBufferToCloudinary = uploadBufferToCloudinary;
