// src/pages/Editor.jsx
import React, { useEffect, useRef, useState } from "react";
import PDFViewerCanvas from "../components/PDFViewerCanvas";
import SignaturePadModal from "../components/SignaturePadModal";
import PdfUpload from "../components/PdfUpload";
import axios from "axios";
import { toast } from "react-toastify";

const BACKEND_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Editor() {
  const viewerRef = useRef();
  const [selected, setSelected] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);

  const [pdfId, setPdfId] = useState("sample-a4.pdf");
  const [pdfUrl, setPdfUrl] = useState(
    `${BACKEND_BASE}/uploads/sample-a4.pdf`
  );
  const [pdfName, setPdfName] = useState("sample-a4.pdf");

  useEffect(() => {
    function handler(e) {
      setSelected(e.detail);
    }
    window.addEventListener("selectFieldType", handler);
    return () => window.removeEventListener("selectFieldType", handler);
  }, []);

  async function handleCoordinatesReady(payload) {
    if (!signatureBase64) {
  toast.info("No signature captured. Opening signature pad.");
  setShowSigModal(true);
  return;
}


    try {
      const body = {
        pdfId: pdfId || payload.pdfId || "sample-a4.pdf",
        signatureBase64,
        coordinates: payload.boxes,
      };

      const res = await axios.post(`${BACKEND_BASE}/sign-pdf`, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.url) {
  const signedUrl = `${BACKEND_BASE}${res.data.url}`;
  toast.success("Signed PDF created successfully");
  window.open(signedUrl, "_blank");
} else {
  toast.warning("PDF signed, but no URL returned. Check server logs.");
}
    } catch (err) {
      console.error(err);
      toast.error(
  "Signing failed: " +
    (err?.response?.data?.error?.message || err.message)
);
    }
  }

  function handleUploaded({ pdfId: id, pdfUrl: url, originalName }) {
    setPdfId(id);
    setPdfUrl(url);
    setPdfName(originalName || id);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3">
        <PdfUpload onUploaded={handleUploaded} currentName={pdfName} />

        <div className="ml-auto flex flex-col items-end gap-2 text-xs text-slate-300">
          <button
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow hover:bg-sky-400"
            onClick={() => setShowSigModal(true)}
          >
            Open Signature Pad
          </button>
          <p>
            Signature:{" "}
            {signatureBase64 ? (
              <span className="font-medium text-emerald-400">
                captured ✔
              </span>
            ) : (
              <span className="text-slate-400">not yet</span>
            )}
          </p>
        </div>
      </div>

      <PDFViewerCanvas
        ref={viewerRef}
        pdfUrl={pdfUrl}
        pdfId={pdfId}
        selectedFieldType={selected}
        onCoordinatesReady={handleCoordinatesReady}
      />

      {showSigModal && (
        <SignaturePadModal
          onClose={() => setShowSigModal(false)}
       onSave={(base64) => {
  setSignatureBase64(base64);
  setShowSigModal(false);
  toast.success(
    "Signature saved. Place a Signature field and press Sign & Burn."
  );
}}
        />
      )}
    </div>
  );
}
