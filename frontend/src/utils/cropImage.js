/**
 * Helper to create an HTMLImageElement asynchronously.
 */
export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Renders cropped image onto canvas and returns a File object ready for upload.
 * @param {string} imageSrc - Object URL or Base64 string of original image
 * @param {Object} pixelCrop - { x, y, width, height } pixel coordinates from react-easy-crop
 * @returns {Promise<File>} Cropped avatar image File object
 */
export async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Unable to process this photo. Please try another image.');
  }

  // Desired high-resolution avatar dimension
  const outputSize = 500;
  canvas.width = outputSize;
  canvas.height = outputSize;

  // Fill canvas with white background as fallback behind transparent areas
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);

  // Draw cropped slice of image onto canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to process this photo. Please try another image.'));
          return;
        }
        const file = new File([blob], 'cropped_avatar.jpg', {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        resolve(file);
      },
      'image/jpeg',
      0.92
    );
  });
}

export default getCroppedImg;
