import React from 'react'
import { useRef } from 'react';
import SignaturePad from "react-signature-canvas"

const SignaturePadModal = ({onClose , onSave}) => {
  const sigRef = useRef();

  function clear() {
    sigRef.current.clear();
  }

  function save() {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("Please draw a signature before saving.");
      return;
    }
    const dataUrl = sigRef.current.getTrimmedCanvas().toDataURL("image/png");
    onSave(dataUrl);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-11/12 max-w-2xl p-6">
        <h3 className="text-lg font-medium mb-3">Draw your signature</h3>
        <div className="border rounded-md p-2">
          <SignaturePad
            ref={sigRef}
            canvasProps={{ className: "sigCanvas", width: 800, height: 200 }}
          />
        </div>

        <div className="mt-4 flex gap-3 justify-end">
          <button
            onClick={clear}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save Signature
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignaturePadModal