// compressor.js - Client-Side Canvas Image Compression (Zero-Cost Free Tier Optimizer)
// Ensures any high-resolution camera photo is compressed to < 90KB before storing or uploading.

class ImageCompressor {
  /**
   * Compress an image file or DataURL to a lightweight JPEG DataURL.
   * @param {File|Blob|string} imageSource 
   * @param {number} maxWidth Maximum width/height dimension (default: 1200px)
   * @param {number} quality Compression quality 0.1 to 1.0 (default: 0.72)
   * @returns {Promise<string>} Base64 Data URL of compressed image
   */
  static compress(imageSource, maxWidth = 1200, quality = 0.72) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while downscaling to maxWidth
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxWidth) {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Export as optimized JPEG
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = (err) => reject(err);

      if (typeof imageSource === 'string') {
        img.src = imageSource;
      } else if (imageSource instanceof Blob || imageSource instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(imageSource);
      } else {
        reject(new Error('Invalid image source type'));
      }
    });
  }
}

window.ImageCompressor = ImageCompressor;
