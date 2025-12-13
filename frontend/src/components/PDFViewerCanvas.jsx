import React, { useRef, useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import FieldOverlay from "./FieldOverlay";
import { pagePixelsToPdfPoints } from "../utils/coordinate";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const PDFViewerCanvas = forwardRef(function PDFViewerCanvas(
  { pdfUrl, selectedFieldType, onCoordinatesReady },
  ref
) {
  const [numPages, setNumPages] = useState(null);
  const [pagePts, setPagePts] = useState(null);
  const [renderedSize, setRenderedSize] = useState(null); 
  const [boxes, setBoxes] = useState([]);
  const containerRef = useRef();
  const pageWrapperRef = useRef();

  useImperativeHandle(ref, () => ({
    getBoxes: () => boxes
  }));

  function onDocumentLoadSuccess(doc) {
    setNumPages(doc.numPages);
  }

  async function onPageLoadSuccess(page) {
    // page is pdfjs page.
    const viewport = page.getViewport({ scale: 1.0 });
    setPagePts({ widthPts: viewport.width, heightPts: viewport.height });

    // set rendered size after DOM paints
    requestAnimationFrame(() => {
      const node = pageWrapperRef.current?.querySelector(".react-pdf__Page");
      if (node) {
        const rect = node.getBoundingClientRect();
        setRenderedSize({ widthPx: rect.width, heightPx: rect.height });
      }
    });
  }

  // Add a default box when selectedFieldType changes
  useEffect(() => {
    if (!selectedFieldType || !renderedSize) return;
    const id = Date.now();
    setBoxes((prev) => [
      ...prev,
      {
        id,
        fieldType: selectedFieldType,
        x: Math.max(12, renderedSize.width * 0.05),
        y: Math.max(12, renderedSize.height * 0.05),
        width: Math.min(220, renderedSize.width * 0.4),
        height: 60,
        page: 1
      }
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFieldType]);

  function updateBox(id, patch) {
    setBoxes((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function removeBox(id) {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  }

  function prepareCoordinatesAndSend() {
    if (!renderedSize || !pagePts) {
      alert("Page not ready yet. Wait for the PDF to render.");
      return;
    }
    // convert boxes measured in pixels to PDF points
    const converted = boxes.map((b) => {
      const boxPx = { x: b.x, y: b.y, width: b.width, height: b.height };
      const conv = pagePixelsToPdfPoints(boxPx, renderedSize, pagePts);
      return { page: b.page || 1, ...conv, fieldType: b.fieldType };
    });

    if (onCoordinatesReady) {
      onCoordinatesReady({
        pdfId: pdfUrl.split("/").pop(), // send a simple id (filename) - adjust per your backend
        page: 1,
        boxes: converted
      });
    }
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex gap-2">
            <button
              onClick={() => {
                // re-measure sizes (useful after viewport change)
                const node = pageWrapperRef.current?.querySelector(".react-pdf__Page");
                if (node) {
                  const rect = node.getBoundingClientRect();
                  setRenderedSize({ widthPx: rect.width, heightPx: rect.height });
                }
              }}
              className="px-3 py-1 rounded bg-white border"
            >
              Re-measure
            </button>
            <button
              onClick={prepareCoordinatesAndSend}
              className="px-3 py-1 rounded bg-blue-600 text-white"
            >
              Sign & Burn
            </button>
          </div>

          <div className="ml-auto text-sm text-slate-600">
            Rendered: {renderedSize ? `${Math.round(renderedSize.widthPx)}×${Math.round(renderedSize.heightPx)} px` : "waiting..."} · PDF pts: {pagePts ? `${Math.round(pagePts.widthPts)}×${Math.round(pagePts.heightPts)}` : "waiting..."}
          </div>
        </div>

        <div ref={containerRef} className="relative inline-block border bg-white">
          <div ref={pageWrapperRef}>
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={<div className="w-[842px] h-[1189px] flex items-center justify-center">Loading PDF…</div>}
            >
              <Page pageNumber={1} onLoadSuccess={onPageLoadSuccess} renderMode="canvas" />
            </Document>
          </div>

          {/* overlays */}
          {renderedSize &&
            boxes.map((b) => (
              <Rnd
                key={b.id}
                bounds="parent"
                size={{ width: b.width, height: b.height }}
                position={{ x: b.x, y: b.y }}
                onDragStop={(e, d) => updateBox(b.id, { x: d.x, y: d.y })}
                onResizeStop={(e, dir, ref, delta, pos) =>
                  updateBox(b.id, {
                    width: parseFloat(ref.style.width),
                    height: parseFloat(ref.style.height),
                    x: pos.x,
                    y: pos.y
                  })
                }
                style={{
                  border: "2px dashed rgba(14,165,233,0.95)",
                  background: "rgba(14,165,233,0.035)",
                  zIndex: 20,
                  padding: 6,
                }}
              >
                <div className="w-full h-full flex flex-col">
                  <FieldOverlay label={b.fieldType} onRemove={() => removeBox(b.id)} />
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
                    {b.fieldType === "Signature" ? "Sign here" : b.fieldType}
                  </div>
                </div>
              </Rnd>
            ))}
        </div>
      </div>

      <aside className="w-80">
        <div className="bg-white p-3 rounded shadow-sm">
          <h4 className="font-medium">Fields</h4>
          <p className="text-sm text-slate-500 mb-3">Click a field in the left toolbar to add it to the PDF (resizable + draggable).</p>
          <div className="grid gap-2">
            {["TextBox", "Signature", "Image", "Date", "Radio"].map((f) => (
              <div key={f}>
                <button
                  className="w-full text-left px-3 py-2 rounded border hover:bg-slate-50"
                  onClick={() => {
                    // parent will control selection; setSelectedFieldType is in Editor
                    const evt = new CustomEvent("selectFieldType", { detail: f });
                    window.dispatchEvent(evt);
                  }}
                >
                  {f}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 text-sm text-slate-600">
            <div>Tip: After adding a Signature field, open the Signature Pad to save a signature image, then press <strong>Sign & Burn</strong>.</div>
          </div>
        </div>
      </aside>
    </div>
  );
});

export default PDFViewerCanvas;
