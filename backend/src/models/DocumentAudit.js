import mongoose from "mongoose";

const DocumentAuditSchema = new mongoose.Schema({
  pdfId: String,
  originalHash: String,
  signedHash: String,
  signedFileUrl: String,
  metadata: Object,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("DocumentAudit", DocumentAuditSchema);
