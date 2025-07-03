/**
 * Coordinate transformation utilities for PDF signature placement.
 * Supports mapping between CSS (screen) and PDF (points) coordinates.
 * PDF origin: bottom-left (0,0). CSS origin: top-left (0,0).
 */

/**
 * Convert CSS (screen) coordinates to PDF coordinates.
 * @param {number} cssX - X in CSS pixels (from left)
 * @param {number} cssY - Y in CSS pixels (from top)
 * @param {number} pageHeight - PDF page height in points
 * @param {number} [scale=1] - Scale factor (screen:PDF)
 * @param {number} [sigHeight=60] - Signature height in points
 * @returns {{x: number, y: number}} PDF coordinates (origin bottom-left)
 */
export function cssToPDF(cssX, cssY, pageHeight, scale = 1, sigHeight = 60) {
  return {
    x: cssX / scale,
    y: (pageHeight - cssY / scale - sigHeight),
  };
}

/**
 * Convert PDF coordinates to CSS (screen) coordinates.
 * @param {number} pdfX - X in PDF points (from left)
 * @param {number} pdfY - Y in PDF points (from bottom)
 * @param {number} pageHeight - PDF page height in points
 * @param {number} [scale=1] - Scale factor (screen:PDF)
 * @returns {{x: number, y: number}} CSS coordinates (origin top-left)
 */
export function pdfToCSS(pdfX, pdfY, pageHeight, scale = 1) {
  return {
    x: pdfX * scale,
    y: (pageHeight - pdfY) * scale,
  };
}

/**
 * Calculate the bounding box of a signature field.
 * @param {object} signature - Signature field object with x, y, width, height
 * @returns {{left: number, top: number, right: number, bottom: number}}
 */
export function calculateBounds(signature) {
  return {
    left: signature.x,
    top: signature.y,
    right: signature.x + signature.width,
    bottom: signature.y + signature.height,
  };
}

/**
 * Check if a point is within bounds.
 * @param {number} x
 * @param {number} y
 * @param {object} bounds - {left, top, right, bottom}
 * @returns {boolean}
 */
export function isWithinBounds(x, y, bounds) {
  return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
} 