import React from "react";

export default function FieldOverlay({ label, onRemove }) {
  return (
    <div className="flex items-center justify-between text-xs text-slate-700 w-full">
      <div className="px-1 text-white">{label}</div>
      <div>
        <button
          onClick={onRemove}
          className="px-1 py-0.5 rounded bg-red-50 text-red-600 hover:bg-red-100"
          title="Remove field"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
