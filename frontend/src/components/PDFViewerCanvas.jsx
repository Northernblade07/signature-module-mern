import React, {
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Rnd } from "react-rnd";
import FieldOverlay from "./FieldOverlay";
import Loader from "./Loader";
import { pagePixelsToPdfPoints } from "../utils/coordinate";
import { toast } from "react-toastify";


const VIEWER_WIDTH = 720;

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

const PDFViewerCanvas = forwardRef(function PDFViewerCanvas(
  { pdfUrl, onCoordinatesReady, pdfId },
  ref
) {
  const [pagePts, setPagePts] = useState(null);
  const [renderedSize, setRenderedSize] = useState(null);
  const [boxes, setBoxes] = useState([]);

  const containerRef = useRef(null);
  const pageWrapperRef = useRef(null);

  // useImperativeHandle(ref, () => ({
  //   getBoxes: () => boxes,
  // }));

  function onPageLoadSuccess(page) {
    const viewport = page.getViewport({ scale: 1 });
    setPagePts({
      widthPts: viewport.width,
      heightPts: viewport.height,
    });

    requestAnimationFrame(() => {
      const node =
        pageWrapperRef.current?.querySelector(".react-pdf__Page");
      if (!node) return;
      const rect = node.getBoundingClientRect();
      setRenderedSize({
        widthPx: rect.width,
        heightPx: rect.height,
      });
    });
  }

  // Reset when PDF changes
  useEffect(() => {
    async function name() {
      setBoxes([]);
      setRenderedSize(null);
      setPagePts(null);
    }
    name();
  }, [pdfId, pdfUrl]);

 function addSignatureBox() {
  if (!renderedSize) {
    toast.error("PDF not ready yet");
    return;
  }

  setBoxes((prev) => [
    ...prev,
    {
      id: Date.now(),
      fieldType: "Signature",
      x: Math.max(12, renderedSize.widthPx * 0.05),
      y: Math.max(12, renderedSize.heightPx * 0.05),
      width: Math.min(220, renderedSize.widthPx * 0.4),
      height: 60,
      page: 1,
    },
  ]);
}

useImperativeHandle(ref, () => ({
  getBoxes: () => boxes,
  addSignatureBox,
}));



  function updateBox(id, patch) {
    setBoxes((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }

  function removeBox(id) {
    setBoxes((prev) => prev.filter((b) => b.id !== id));
  }

  function remeasure() {
    const node =
      pageWrapperRef.current?.querySelector(".react-pdf__Page");
    if (!node) return;
    const rect = node.getBoundingClientRect();
    setRenderedSize({
      widthPx: rect.width,
      heightPx: rect.height,
    });
  }

  function prepareCoordinatesAndSend() {
    if (!renderedSize || !pagePts) {
      toast.error("PDF is still rendering. Please wait a moment.");
      return;
    }
    if (!boxes.length) {
      toast.info("Add at least one field on the PDF before signing.");
      return;
    }
    const converted = boxes.map((b) => {
      const conv = pagePixelsToPdfPoints(
        { x: b.x, y: b.y, width: b.width, height: b.height },
        renderedSize,
        pagePts
      );
      return { page: b.page || 1, ...conv, fieldType: b.fieldType };
    });

    toast.success("Fields locked. Processing signature…");

    onCoordinatesReady?.({
      pdfId: pdfId || pdfUrl.split("/").pop(),
      page: 1,
      boxes: converted,
    });
  }

  return (
    <div className="flex gap-5">
      <div className="flex-1">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={remeasure}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:border-sky-500 hover:text-sky-300"
            >
              Re-measure
            </button>
            <button
              onClick={prepareCoordinatesAndSend}
              className="rounded-lg bg-gradient-to-r from-sky-500 to-fuchsia-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-sky-400 hover:to-fuchsia-400"
            >
              Sign &amp; Burn
            </button>
          </div>

          <div className="ml-auto text-xs text-slate-400">
            Rendered:{" "}
            {renderedSize
              ? `${Math.round(renderedSize.widthPx)}×${Math.round(
                renderedSize.heightPx
              )} px`
              : "waiting…"}{" "}
            · PDF pts:{" "}
            {pagePts
              ? `${Math.round(pagePts.widthPts)}×${Math.round(
                pagePts.heightPts
              )}`
              : "waiting…"}
          </div>
        </div>

        <div
          ref={containerRef}
          className="relative inline-block overflow-hidden rounded-xl border border-slate-800 bg-slate-900/80 shadow-lg"
        >
          <div ref={pageWrapperRef}>
            {pdfUrl && (
              <Document
                file={pdfUrl}
                loading={<Loader label="Rendering PDF…" />}
              // error={
              //   <div className="flex items-center justify-center p-10 text-sm text-red-300">
              //     Failed to load PDF. Check the URL or upload again.
              //   </div>
              // }
              >
                <Page
                  pageNumber={1}
                  renderMode="canvas"
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={700}
                  onLoadSuccess={onPageLoadSuccess}
                />

              </Document>
            )}
          </div>

          {renderedSize &&
            boxes.map((b) => (
              <Rnd
                key={b.id}
                bounds="parent"
                size={{ width: b.width, height: b.height }}
                position={{ x: b.x, y: b.y }}
                onDragStop={(_e, d) =>
                  updateBox(b.id, { x: d.x, y: d.y })
                }
                onResizeStop={(_e, _dir, ref, _delta, pos) =>
                  updateBox(b.id, {
                    width: parseFloat(ref.style.width),
                    height: parseFloat(ref.style.height),
                    x: pos.x,
                    y: pos.y,
                  })
                }
                style={{
                  border: "2px dashed rgba(56,189,248,0.95)",
                  background: "rgba(8,47,73,0.7)",
                  borderRadius: 10,
                  padding: 6,
                  zIndex: 20,
                }}
              >
                <div className="flex h-full flex-col">
                  <FieldOverlay
                    label={b.fieldType}
                    onRemove={() => removeBox(b.id)}
                  />
                  <div className="flex flex-1 items-center justify-center text-xs text-slate-200">
                    {b.fieldType === "Signature" ? "Sign here" : b.fieldType}
                  </div>
                </div>
              </Rnd>
            ))}
        </div>
      </div>

      <aside className="w-92">
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow ">
          <h4 className="mb-2 text-m font-semibold text-slate-100">Fields</h4>
          <p className="mb-3 text-sm text-slate-400">
            Click a field to add it to the current page. Drag &amp; resize to
            position exactly.
          </p>
          <div className="grid gap-2">
            {["Signature"].map((f) => (
              <button
  className="w-full rounded-lg border mt-1 border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm font-medium text-slate-100 hover:border-sky-500 hover:bg-slate-800"
  onClick={() => {
    ref?.current?.addSignatureBox(f);
  }}
>
  Signature
</button>
            ))}
          </div>

          <div className="mt-4 text-xs text-slate-400">
            Tip: For signatures, place the field where you want the final
            signature to appear, then hit{" "}
            <span className="font-semibold text-sky-300">
              Sign &amp; Burn
            </span>
            .
          </div>
        </div>
      </aside>
    </div>
  );
});

export default PDFViewerCanvas;
