// Cloudinary upload utility
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  url: string;
}

export const uploadToCloudinary = async (
  file: File | Blob,
  folder?: string
): Promise<CloudinaryUploadResponse> => {
  // Validate environment variables
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in .env');
  }
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary upload preset is not configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET in .env');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  if (folder) {
    formData.append('folder', folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary upload error:', errorData);
      throw new Error(
        errorData.error?.message || 
        `Failed to upload image to Cloudinary: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const uploadBase64ToCloudinary = async (
  base64String: string,
  folder?: string
): Promise<CloudinaryUploadResponse> => {
  // Validate environment variables
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME in .env');
  }
  if (!CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary upload preset is not configured. Please set VITE_CLOUDINARY_UPLOAD_PRESET in .env');
  }

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  if (folder) {
    formData.append('folder', folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Cloudinary upload error:', errorData);
      throw new Error(
        errorData.error?.message || 
        `Failed to upload image to Cloudinary: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  // Note: Deletion requires authenticated request from backend
  // This is a placeholder - implement backend endpoint for deletion
  console.warn('Delete from Cloudinary should be handled by backend');
};
