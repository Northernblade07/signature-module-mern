// src/components/SignaturePadModal.jsx
import React, { useRef } from "react";
import SignaturePad from "react-signature-canvas";
import { toast } from "react-toastify";

const SignaturePadModal = ({ onClose, onSave }) => {
  const sigRef = useRef(null);

  function clear() {
    sigRef.current?.clear();
    toast.info("Signature cleared");
  }

  function save() {
    const pad = sigRef.current;

    if (!pad || pad.isEmpty()) {
      toast.error("Please draw a signature before saving.");
      return;
    }

    // Use raw canvas to avoid trimming issues
    const canvas = pad.getCanvas();
    const dataUrl = canvas.toDataURL("image/png");

  onSave(dataUrl);
  }

  return (
   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-2">
  <div className="w-full max-w-2xl rounded-xl bg-white p-4 sm:p-6 shadow-xl">
    <h3 className="mb-3 text-base sm:text-lg font-medium">
      Draw your signature
    </h3>

        <div className="rounded-md border p-2 overflow-x-auto">
      <SignaturePad
        ref={sigRef}
        canvasProps={{
          className: "sigCanvas",
          width: 800,
          height: 200,
        }}
      />
    </div>


        <div className="mt-4 flex justify-end gap-3  flex-wrap sm:gap-4">
          <button
            onClick={clear}
            className="rounded bg-gray-600 px-4 py-2 hover:bg-gray-200"
          >
            Clear
          </button>

          <button
            onClick={onClose}
            className="rounded bg-red-400 px-4 py-2 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePadModal;
