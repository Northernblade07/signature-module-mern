import React from 'react'
import Editor from "./pages/Editor";

const App = () => {
  return (
   <div className="min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-semibold text-slate-800">Signature Injection Engine — Prototype</h1>
          <p className="text-sm text-slate-500 mt-1">Drag/drop fields on a rendered PDF, capture signature, and burn into PDF with audit hashes.</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <Editor />
      </main>
    </div>
  )
}

export default App