// src/services/pdfServices.js
import { PDFDocument } from "pdf-lib";

/**
 * @typedef {Object} SignatureBox
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/**
 * Burn a signature image into a PDF buffer.
 *
 * @param {Buffer} pdfBuffer - Original PDF bytes
 * @param {string} base64Img - Base64 data URL or raw base64
 * @param {SignatureBox} box - Box in PDF points (origin bottom-left)
 * @param {number} pageIndex - Zero-based page index
 * @returns {Promise<Buffer>} - New PDF bytes
 */
export async function burnSignatureIntoPdf(
  pdfBuffer,
  base64Img,
  box,
  pageIndex
) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  // Normalize base64 (strip data URL prefix if present)
  const imgData = base64Img.includes(",")
    ? base64Img.split(",")[1]
    : base64Img;

  const imgBytes = Buffer.from(imgData, "base64");

  const image = await pdfDoc.embedPng(imgBytes).catch(async () => {
    return pdfDoc.embedJpg(imgBytes);
  });

  const pages = pdfDoc.getPages();
  const page = pages[pageIndex] ?? pages[0];

  const imgW = image.width;
  const imgH = image.height;

  const boxW = box.width;
  const boxH = box.height;

  if (boxW <= 0 || boxH <= 0) {
    throw new Error("Invalid box dimensions");
  }

  const imgRatio = imgW / imgH;
  const boxRatio = boxW / boxH;

  let drawW;
  let drawH;

  // Fit image inside box while preserving aspect ratio
  if (imgRatio > boxRatio) {
    drawW = boxW;
    drawH = drawW / imgRatio;
  } else {
    drawH = boxH;
    drawW = drawH * imgRatio;
  }

  // Center inside the box
  const x = box.x + (boxW - drawW) / 2;
  const y = box.y + (boxH - drawH) / 2;

  page.drawImage(image, {
    x,
    y,
    width: drawW,
    height: drawH,
  });

  const newPdfBytes = await pdfDoc.save();
  return Buffer.from(newPdfBytes);
}
