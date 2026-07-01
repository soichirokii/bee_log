import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 外部URLをCloudinaryにアップロードして永続URL（secure_url）を返す
export async function uploadToCloudinary(
  imageUrl: string,
  publicId?: string
): Promise<string> {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: "beelog",
    public_id: publicId,
    overwrite: false,
  });
  return result.secure_url;
}
