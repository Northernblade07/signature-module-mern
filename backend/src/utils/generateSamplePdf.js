// src/utils/generateSamplePdf.js
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function generateSamplePdfIfMissing(uploadDir) {
  const filePath = path.join(uploadDir, "sample.pdf");

  if (fs.existsSync(filePath)) {
    return;
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  page.drawText("Sample Signature Test Document", {
    x: 50,
    y: 780,
    size: 18,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText("This is a demo PDF used to test digital signing.", {
    x: 50,
    y: 740,
    size: 12,
    font,
  });

  page.drawText("Instructions:", {
    x: 50,
    y: 700,
    size: 14,
    font,
  });

  page.drawText(
    "1. Click 'Signature' to place a signature box.\n" +
    "2. Open the signature pad and draw.\n" +
    "3. Click 'Sign & Burn' to embed the signature.",
    {
      x: 50,
      y: 660,
      size: 11,
      font,
      lineHeight: 16,
    }
  );

  // Signature guide box
  page.drawRectangle({
    x: 50,
    y: 500,
    width: 250,
    height: 60,
    borderWidth: 1,
    borderColor: rgb(0.2, 0.6, 0.9),
  });

  page.drawText("Sign here", {
    x: 60,
    y: 525,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  console.log("✅ Sample PDF generated:", filePath);
}
