const ALLOWED_TYPES = ["image/jpeg", "image/png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export class ImageValidationError extends Error {}

export function validateImageFile(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new ImageValidationError("Only .jpg, .jpeg, and .png images are allowed");
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new ImageValidationError("Image must be smaller than 10MB");
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  validateImageFile(file);

  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  );
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.secure_url as string;
}
