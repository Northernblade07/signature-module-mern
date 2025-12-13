import express from "express";
import { signPdf } from "../controllers/pdf.controller.js";

const router = express.Router();

router.post("/sign-pdf", signPdf);

export default router;
