// Cloudinary utility functions
const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dtisvx6br";
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "binbuddy_avatars";

/**
 * Upload a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {Object} options - Additional options
 * @param {string} options.folder - The folder to upload to (default: 'avatars')
 * @param {Function} options.onProgress - Progress callback function
 * @returns {Promise<Object>} - The Cloudinary response
 */
export const uploadToCloudinary = async (file, options = {}) => {
  if (!file) {
    throw new Error('No file provided');
  }

  const { folder = 'avatars', onProgress } = options;
  
  // Create form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);
  
  try {
    // Use XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Set up progress handler
      if (typeof onProgress === 'function') {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        };
      }
      
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/upload`);
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } else {
          reject(new Error('Upload failed'));
        }
      };
      
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Get the Cloudinary URL for an image
 * @param {string} publicId - The public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} - The Cloudinary URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  const { 
    width, 
    height, 
    crop = 'fill', 
    gravity = 'faces',
    quality = 'auto',
    format = 'auto',
    effect = null
  } = options;
  
  let transformations = [];
  
  // Add width and height if provided
  if (width && height) {
    transformations.push(`c_${crop},g_${gravity},w_${width},h_${height}`);
  } else if (width) {
    transformations.push(`w_${width}`);
  } else if (height) {
    transformations.push(`h_${height}`);
  }
  
  // Add effect if provided
  if (effect) {
    transformations.push(`e_${effect}`);
  }
  
  // Add quality and format
  transformations.push(`q_${quality},f_${format}`);
  
  const transformationString = transformations.join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}/${publicId}`;
};

export default {
  uploadToCloudinary,
  getCloudinaryUrl,
  cloudName,
  uploadPreset
}; 