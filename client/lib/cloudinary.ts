import { v2 as cloudinary } from "cloudinary";

const cloudName = process.env.NEXT_CLOUD_NAME || "";
const apiKey = process.env.NEXT_CLOUD_API_KEY || "";
const apiSecret = process.env.NEXT_CLOUD_API_SECRET || "";

export const cloudinaryClient = cloudinary 

cloudinaryClient.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret, // Click 'View API Keys' above to copy your API secret
});

