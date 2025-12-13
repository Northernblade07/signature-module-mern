// src/controllers/pdf.controller.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { hashBuffer } from "../utils/hash.js";
import DocumentAudit from "../models/DocumentAudit.js";
import { burnSignatureIntoPdf } from "../services/pdfServices.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Ensure uploads directory exists at startup
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Validates sign-pdf payload and returns error object or null.
 */
function validateSignPdfPayload(body) {
  const { pdfId, signatureBase64, coordinates } = body || {};

  if (!pdfId || typeof pdfId !== "string") {
    return { code: "INVALID_PDF_ID", message: "pdfId is required and must be a string" };
  }
  if (!signatureBase64 || typeof signatureBase64 !== "string") {
    return {
      code: "INVALID_SIGNATURE",
      message: "signatureBase64 is required and must be a string",
    };
  }
  if (!Array.isArray(coordinates) || coordinates.length === 0) {
    return {
      code: "INVALID_COORDINATES",
      message: "coordinates must be a non-empty array",
    };
  }

  for (const c of coordinates) {
    if (
      typeof c.x !== "number" ||
      typeof c.y !== "number" ||
      typeof c.width !== "number" ||
      typeof c.height !== "number"
    ) {
      return {
        code: "INVALID_COORDINATES_SHAPE",
        message: "Each coordinate must have numeric x, y, width, height",
      };
    }
  }

  if (coordinates.length > 50) {
    return {
      code: "TOO_MANY_BOXES",
      message: "Too many coordinates; max 50 boxes allowed",
    };
  }

  return null;
}

export async function signPdf(req, res) {
  try {
    const validationError = validateSignPdfPayload(req.body);
    if (validationError) {
      return res.status(422).json({ error: validationError });
    }

    const { pdfId, signatureBase64, coordinates } = req.body;

    const pdfPath = path.join(UPLOAD_DIR, pdfId);

    if (!fs.existsSync(pdfPath)) {
      return res.status(404).json({
        error: {
          code: "PDF_NOT_FOUND",
          message: "PDF not found on server",
        },
      });
    }

    const stat = fs.statSync(pdfPath);
    const maxBytes = 20 * 1024 * 1024; // 20 MB
    if (stat.size > maxBytes) {
      return res.status(413).json({
        error: {
          code: "PDF_TOO_LARGE",
          message: "PDF size exceeds limit",
        },
      });
    }

    const originalBuffer = fs.readFileSync(pdfPath);
    const originalHash = hashBuffer(originalBuffer);

    let workingPdf = originalBuffer;

    for (const coord of coordinates) {
      const pageIndex = (coord.page || 1) - 1;
      workingPdf = await burnSignatureIntoPdf(
        workingPdf,
        signatureBase64,
        coord,
        pageIndex
      );
    }

    const signedHash = hashBuffer(workingPdf);

    const outName = `signed-${Date.now()}.pdf`;
    const outPath = path.join(UPLOAD_DIR, outName);
    fs.writeFileSync(outPath, workingPdf);

    const audit = await DocumentAudit.create({
      pdfId,
      originalHash,
      signedHash,
      signedFileUrl: `/uploads/${outName}`,
      metadata: { coordinates },
    });

    return res.status(200).json({
      success: true,
      url: audit.signedFileUrl,
      auditId: audit._id,
    });
  } catch (err) {
    console.error("signPdf error:", err);
    return res.status(500).json({
      error: {
        code: "SIGN_PDF_FAILED",
        message: "PDF signing failed",
      },
    });
  }
}
