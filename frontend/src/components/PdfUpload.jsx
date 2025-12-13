// src/components/PdfUpload.jsx
import React, { useState } from "react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../utils/api";

export default function PdfUpload({ onUploaded, currentName }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  // const [error, setError] = useState(null);

  async function handleFile(file) {
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed.");
      return;
    }
    // setError(null);
    setUploading(true);

    try {
      const form = new FormData();
      form.append("pdf", file);

       const res = await api.post("/upload-pdf", form);

      const data = res.data;
      if (!data?.success) {
        throw new Error(data?.error?.message || "Upload failed");
      }
      toast.success("PDF uploaded successfully");
      onUploaded({
        pdfId: data.pdfId,
        pdfUrl: data.url,
        originalName: data.originalName,
      });
    } catch (err) {
      console.error(err);
        toast.error(err.message || "PDF upload failed.");
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  function onChange(e) {
    const file = e.target.files?.[0];
    handleFile(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-100">PDF document</p>
        {currentName && (
          <p className="truncate text-xs text-slate-400">
            Current: <span className="font-medium text-sky-400">{currentName}</span>
          </p>
        )}
      </div>

      <Motion.label
        onDragOver={(e) => {
          e.preventDefault();
          if (!isDragging) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={onDrop}
        className={[
          "group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition",
          isDragging
            ? "border-sky-400 bg-sky-500/10"
            : "border-slate-600 bg-slate-900/80 hover:border-sky-400 hover:bg-slate-900",
        ].join(" ")}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/20 text-sky-300">
          <span className="text-lg">📄</span>
        </div>
        <p className="font-medium text-slate-100">
          Drop a PDF here{" "}
          <span className="text-sky-400">or click to browse</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Max 20MB · Only <span className="font-mono">.pdf</span> files
        </p>

        <input
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={onChange}
        />
      </Motion.label>

      <div className="flex items-center justify-between text-xs text-slate-400">
        {uploading && <p className="text-sky-400">Uploading PDF…</p>}
        {isDragging && !uploading && <p>Release to upload</p>}
      </div>
    </div>
  );
}
