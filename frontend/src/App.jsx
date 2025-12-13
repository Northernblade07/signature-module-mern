import React from 'react'
import Editor from "./pages/Editor";

const App = () => {
  return (
   <div className="min-h-screen bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 bg-gradient-to-r from-sky-600/20 via-sky-500/10 to-fuchsia-500/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Signature Injection Engine
          </h1>
          <p className="max-w-2xl text-sm text-slate-300">
            Upload a PDF, drag & drop fields, capture a signature, and burn it into the document with an audit trail.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Editor />
      
      </main>
    </div>
  )
}

export default App