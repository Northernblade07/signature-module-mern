/**
 * Convert a box measured in rendered pixels on the page to PDF points (72 DPI).
 *
 * - pageRendered: {widthPx, heightPx} the pixel size of the rendered PDF page DOM
 * - pdfPagePts: {widthPts, heightPts} the PDF page dimensions in points (units used in PDF)
 *
 * The origin in the browser is top-left; in PDF it's bottom-left. We return coordinates
 * in PDF coordinates: x (from left), y (from bottom), width, height.
 *
 * Math:
 *  xPts = (xPx / widthPx) * widthPts
 *  widthPts = (wPx / widthPx) * widthPts
 *  heightPts = (hPx / heightPx) * heightPts
 *  yPxFromBottom = heightPx - (yPx + hPx)
 *  yPts = (yPxFromBottom / heightPx) * heightPts
 */
export function pagePixelsToPdfPoints(boxPx, pageRendered, pdfPagePts) {
  const { x, y, width: wPx, height: hPx } = boxPx;
  const { widthPx, heightPx } = pageRendered;
  const { widthPts, heightPts } = pdfPagePts;

  if (!widthPx || !heightPx || !widthPts || !heightPts) {
    throw new Error("Invalid page dimensions for conversion");
  }

  const xPts = (x / widthPx) * widthPts;
  const wPts = (wPx / widthPx) * widthPts;
  const hPts = (hPx / heightPx) * heightPts;

  const yPxFromBottom = heightPx - (y + hPx);
  const yPts = (yPxFromBottom / heightPx) * heightPts;

  return {
    x: Number(xPts.toFixed(3)),
    y: Number(yPts.toFixed(3)),
    width: Number(wPts.toFixed(3)),
    height: Number(hPts.toFixed(3))
  };
}
