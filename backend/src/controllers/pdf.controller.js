import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { hashBuffer } from "../utils/hash.js";
import DocumentAudit from "../models/DocumentAudit.js";
import { burnSignatureIntoPdf } from "../services/pdfServices.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

export async function signPdf(req, res) {
  try {
    const { pdfId, signatureBase64, coordinates } = req.body;

    if (!pdfId || !signatureBase64 || !coordinates?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const pdfPath = path.join(UPLOAD_DIR, pdfId);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({ error: "PDF not found" });
    }

    const originalBuffer = fs.readFileSync(pdfPath);
    const oldHash = await hashBuffer(originalBuffer);

    let workingPdf = originalBuffer;

    for (const c of coordinates) {
      workingPdf = await burnSignatureIntoPdf(
        workingPdf,
        signatureBase64,
        c,
        (c.page || 1) - 1
      );
    }

    const newHash = await hashBuffer(workingPdf);

    const outName = `signed-${Date.now()}.pdf`;
    const outPath = path.join(UPLOAD_DIR, outName);
    fs.writeFileSync(outPath, workingPdf);

    const audit = await DocumentAudit.create({
      pdfId,
      originalHash: oldHash,
      signedHash: newHash,
      signedFileUrl: `/uploads/${outName}`,
      metadata: { coordinates }
    });

    return res.json({ success: true, url: audit.signedFileUrl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "PDF signing failed" });
  }
}
