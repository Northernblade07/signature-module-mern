// src/routes/pdf.route.js
import express from "express";
import { signPdf } from "../controllers/pdf.controller.js";
import { uploadPdf } from "../lib/multer.js";

const router = express.Router();

// Upload a PDF and get pdfId + URL back
router.post("/upload-pdf", uploadPdf.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: { code: "NO_FILE", message: "PDF file is required" },
    });
  }

  return res.status(200).json({
    success: true,
    pdfId: req.file.filename,
    url: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
  });
});

// Sign an existing PDF on the server
router.post("/sign-pdf", signPdf);

export default router;
