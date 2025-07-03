import { PDFDocument, PDFImage } from 'pdf-lib';

/**
 * Embeds signature images into PDF with proper transformation matrix
 * @param {ArrayBuffer} pdfBuffer - Original PDF buffer
 * @param {Array} signatureFields - Array of signature field objects with position, size, rotation
 * @returns {Promise<ArrayBuffer>} - Modified PDF buffer
 */
export const embedSignaturesWithTransform = async (pdfBuffer, signatureFields) => {
  try {
    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    // Process each signature field
    for (const field of signatureFields) {
      if (!field.signature?.data || !field.page) continue;
      
      // Get the page (0-indexed)
      const page = pdfDoc.getPage(field.page - 1);
      if (!page) continue;
      
      // Convert base64 image to Uint8Array
      const imageData = field.signature.data;
      let imageBytes;
      
      if (imageData.startsWith('data:image/')) {
        // Handle base64 data URL
        const base64Data = imageData.split(',')[1];
        imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      } else {
        // Handle raw base64 string
        imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
      }
      
      // Embed the image
      let pdfImage;
      if (imageData.includes('image/png')) {
        pdfImage = await pdfDoc.embedPng(imageBytes);
      } else if (imageData.includes('image/jpeg') || imageData.includes('image/jpg')) {
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        console.warn('Unsupported image format:', imageData);
        continue;
      }
      
      // Get page dimensions
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      // Calculate position (PDF coordinates start from bottom-left)
      const x = field.x;
      const y = pageHeight - field.y - field.height; // Flip Y coordinate
      
      // Calculate transformation matrix for rotation and scaling
      const rotationRad = (field.rotation || 0) * (Math.PI / 180);
      const cos = Math.cos(rotationRad);
      const sin = Math.sin(rotationRad);
      
      // Calculate center point for rotation
      const centerX = x + field.width / 2;
      const centerY = y + field.height / 2;
      
      // Build transformation matrix
      // [a b c d e f] where:
      // a = scaleX * cos(rotation)
      // b = scaleX * sin(rotation)
      // c = -scaleY * sin(rotation)
      // d = scaleY * cos(rotation)
      // e = translateX
      // f = translateY
      
      const scaleX = field.width / pdfImage.width;
      const scaleY = field.height / pdfImage.height;
      
      const matrix = [
        scaleX * cos,           // a
        scaleX * sin,           // b
        -scaleY * sin,          // c
        scaleY * cos,           // d
        centerX - (centerX * cos - centerY * sin), // e (translation X)
        centerY - (centerX * sin + centerY * cos)  // f (translation Y)
      ];
      
      // Draw the image with transformation
      page.drawImage(pdfImage, {
        x: 0,
        y: 0,
        width: pdfImage.width,
        height: pdfImage.height,
        transform: matrix
      });
    }
    
    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;
    
  } catch (error) {
    console.error('Error embedding signatures:', error);
    throw new Error('Failed to embed signatures into PDF');
  }
};

/**
 * Alternative method using simpler transformation for better compatibility
 */
export const embedSignaturesSimple = async (pdfBuffer, signatureFields) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    
    for (const field of signatureFields) {
      if (!field.signature?.data || !field.page) continue;
      
      const page = pdfDoc.getPage(field.page - 1);
      if (!page) continue;
      
      // Convert image data
      const imageData = field.signature.data;
      let imageBytes;
      
      if (imageData.startsWith('data:image/')) {
        const base64Data = imageData.split(',')[1];
        imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      } else {
        imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
      }
      
      // Embed image
      let pdfImage;
      if (imageData.includes('image/png')) {
        pdfImage = await pdfDoc.embedPng(imageBytes);
      } else if (imageData.includes('image/jpeg') || imageData.includes('image/jpg')) {
        pdfImage = await pdfDoc.embedJpg(imageBytes);
      } else {
        continue;
      }
      
      const { width: pageWidth, height: pageHeight } = page.getSize();
      
      // Calculate position
      const x = field.x;
      const y = pageHeight - field.y - field.height;
      
      // Draw with rotation and scaling
      page.drawImage(pdfImage, {
        x,
        y,
        width: field.width,
        height: field.height,
        rotate: { angle: field.rotation || 0, type: 'degrees' }
      });
    }
    
    const modifiedPdfBytes = await pdfDoc.save();
    return modifiedPdfBytes;
    
  } catch (error) {
    console.error('Error embedding signatures (simple method):', error);
    throw new Error('Failed to embed signatures into PDF');
  }
};

/**
 * Creates a flattened signature image with proper styling
 */
export const createFlattenedSignatureImage = async (signatureData, width, height, rotation = 0) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;
    
    // Create image
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Apply transformations
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-width / 2, -height / 2);
      
      // Draw image with proper scaling
      const scaleX = width / img.width;
      const scaleY = height / img.height;
      const scale = Math.min(scaleX, scaleY);
      
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;
      
      // Apply subtle shadow for embedded look
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      ctx.restore();
      
      // Convert to base64
      const flattenedData = canvas.toDataURL('image/png');
      resolve(flattenedData);
    };
    
    img.src = signatureData;
  });
}; 