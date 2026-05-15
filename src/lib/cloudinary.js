const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME?.trim();
const CLOUDINARY_UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET?.trim();

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
  console.error('Missing Cloudinary environment variables');
}

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} - Cloudinary image URL
 */
export async function uploadToCloudinary(file) {
  if (!file) {
    throw new Error('No file selected for upload.');
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Check REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const cloudinaryMessage = data?.error?.message || response.statusText;
      const presetHint =
        cloudinaryMessage.toLowerCase().includes('upload preset not found')
          ? ` Check that an unsigned upload preset named "${CLOUDINARY_UPLOAD_PRESET}" exists in Cloudinary cloud "${CLOUDINARY_CLOUD_NAME}", then restart the React dev server.`
          : '';
      throw new Error(`Cloudinary upload failed: ${cloudinaryMessage}.${presetHint}`);
    }

    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}

/**
 * Generate Cloudinary URL with transformations
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed Cloudinary URL
 */
export function getCloudinaryUrl(publicId, options = {}) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    fetch_format = 'auto',
  } = options;

  let url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
  
  if (width || height) {
    url += `w_${width || 'auto'},h_${height || 'auto'},c_${crop},q_${quality},f_${fetch_format}/`;
  } else {
    url += `q_${quality},f_${fetch_format}/`;
  }

  url += publicId;
  return url;
}

/**
 * Delete image from Cloudinary
 * Note: This requires a signed request or delete token
 * For frontend-only apps, consider using Cloudinary's signed delete URLs
 */
export function getDeleteUrl(publicId, timestamp, signature) {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload/${publicId}?public_id=${publicId}&timestamp=${timestamp}&signature=${signature}&api_key=${process.env.REACT_APP_CLOUDINARY_API_KEY}`;
}
