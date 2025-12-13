import mongoose from "mongoose";

const DocumentAuditSchema = new mongoose.Schema(
  {
    pdfId: {
      type: String,
      required: true,
      index: true,
    },
    originalHash: {
      type: String,
      required: true,
    },
    signedHash: {
      type: String,
      required: true,
    },
    signedFileUrl: {
      type: String,
      required: true,
    },
    metadata: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

DocumentAuditSchema.index({ pdfId: 1, createdAt: -1 });

export default mongoose.model("DocumentAudit", DocumentAuditSchema);
