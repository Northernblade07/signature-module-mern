import { PDFDocument } from "pdf-lib";

export async function burnSignatureIntoPdf(pdfBuffer, base64Img, box, pageIndex) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);

  let imgData = base64Img.includes(",")
    ? base64Img.split(",")[1]
    : base64Img;

  const imgBytes = Buffer.from(imgData, "base64");

  const png = await pdfDoc.embedPng(imgBytes).catch(async () => {
    return await pdfDoc.embedJpg(imgBytes);
  });

  const page = pdfDoc.getPages()[pageIndex];

  const imgW = png.width;
  const imgH = png.height;

  const boxW = box.width;
  const boxH = box.height;

  const imgRatio = imgW / imgH;
  const boxRatio = boxW / boxH;

  let drawW, drawH;

  if (imgRatio > boxRatio) {
    drawW = boxW;
    drawH = drawW / imgRatio;
  } else {
    drawH = boxH;
    drawW = drawH * imgRatio;
  }

  const x = box.x + (boxW - drawW) / 2;
  const y = box.y + (boxH - drawH) / 2;

  page.drawImage(png, {
    x,
    y,
    width: drawW,
    height: drawH
  });

  return Buffer.from(await pdfDoc.save());
}
