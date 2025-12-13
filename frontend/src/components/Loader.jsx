// src/components/Loader.jsx
import React from "react";

export default function Loader({ label = "Loading…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
      <p className="text-xs font-medium tracking-wide text-slate-300">
        {label}
      </p>
    </div>
  );
}
