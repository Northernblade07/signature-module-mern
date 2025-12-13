import React, { useEffect, useRef, useState } from "react";
import PDFViewerCanvas from "../components/PDFViewerCanvas";
import SignaturePadModal from "../components/SignaturePadModal";
import axios from "axios";

/**
 * Adjust this to your backend endpoint:
 * If your backend runs at http://localhost:4000 you'll be fine.
 */
const BACKEND_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export default function Editor() {
  const viewerRef = useRef();
  const [selected, setSelected] = useState(null);
  const [showSigModal, setShowSigModal] = useState(false);
  const [signatureBase64, setSignatureBase64] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("/sample-a4.pdf"); // ensure this file is available in public/

  useEffect(() => {
    function handler(e) {
      setSelected(e.detail);
    }
    window.addEventListener("selectFieldType", handler);
    return () => window.removeEventListener("selectFieldType", handler);
  }, []);

  async function handleCoordinatesReady(payload) {
    // payload: { pdfId, page, boxes: [{page,x,y,width,height,fieldType}, ...] }
    if (!signatureBase64) {
      if (!confirm("No signature captured. Open Signature Pad now?")) return;
      setShowSigModal(true);
      return;
    }

    try {
      const body = {
        pdfId: payload.pdfId || "sample-a4.pdf",
        signatureBase64,
        coordinates: payload.boxes
      };

      const res = await axios.post(`${BACKEND_BASE}/sign-pdf`, body, { headers: { "Content-Type": "application/json" }});
      if (res.data?.url) {
        alert("Signed PDF created: " + res.data.url);
        window.open(`${BACKEND_BASE}${res.data.url}`, "_blank");
      } else {
        alert("Signed but no URL returned. Check server logs.");
      }
    } catch (err) {
      console.error(err);
      alert("Signing failed: " + (err?.response?.data?.error || err.message));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div>
          <button
            className="px-3 py-2 bg-white border rounded"
            onClick={() => {
              setShowSigModal(true);
            }}
          >
            Open Signature Pad
          </button>
        </div>

        <div className="text-sm text-slate-600">
          {signatureBase64 ? <span className="text-green-600">Signature captured ✔</span> : <span>No signature yet</span>}
        </div>

        <div className="ml-auto">
          <label className="text-sm text-slate-600 mr-2">PDF to edit:</label>
          <input
            value={pdfUrl}
            onChange={(e) => setPdfUrl(e.target.value)}
            className="px-2 py-1 border rounded"
          />
          <small className="block text-xs text-slate-400">You can point to an absolute URL or a file in public/</small>
        </div>
      </div>

      <PDFViewerCanvas
        ref={viewerRef}
        pdfUrl={pdfUrl}
        selectedFieldType={selected}
        onCoordinatesReady={handleCoordinatesReady}
      />

      {showSigModal && (
        <SignaturePadModal
          onClose={() => setShowSigModal(false)}
          onSave={(base64) => {
            setSignatureBase64(base64);
            setShowSigModal(false);
            alert("Signature saved locally. Now place a Signature field and press Sign & Burn.");
          }}
        />
      )}
    </div>
  );
}
