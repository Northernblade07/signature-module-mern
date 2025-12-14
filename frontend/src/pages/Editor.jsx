// src/pages/Editor.jsx
import React, { useEffect, useRef, useState } from "react";
import PDFViewerCanvas from "../components/PDFViewerCanvas";
import SignaturePadModal from "../components/SignaturePadModal";
import PdfUpload from "../components/PdfUpload";
import { toast } from "react-toastify";
import api from "../utils/api";


export default function Editor() {
  const viewerRef = useRef();
  const [selected, setSelected] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);

  const [pdfId, setPdfId] = useState("sample.pdf");
  const [pdfUrl, setPdfUrl] = useState("/uploads/sample.pdf");
  const [pdfName, setPdfName] = useState("sample.pdf");

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

      const res = await api.post(`/sign-pdf`, body, {
        headers: { "Content-Type": "application/json" },
      });

      if (res.data?.url) {
  const signedUrl = res.data.url;
window.open(signedUrl, "_blank");
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
      <div className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-4 sm:flex-row sm:items-center">
        <PdfUpload onUploaded={handleUploaded} currentName={pdfName} />

        <div className="flex w-full flex-col gap-2 text-xs text-slate-300 sm:ml-auto sm:w-auto sm:items-end">
          <button
            className="rounded-lg bg-sky-500 px-3 py-1.5 text-s font-semibold text-slate-900 shadow hover:bg-sky-400"
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

            <div className="w-full overflow-x-auto">

      <PDFViewerCanvas
        ref={viewerRef}
        pdfUrl={pdfUrl}
        pdfId={pdfId}
        selectedFieldType={selected}
        onCoordinatesReady={handleCoordinatesReady}
        />
        
        </div>

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
