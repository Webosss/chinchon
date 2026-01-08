import React from 'react'

export default function Modal({ title, children, onClose }){
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-800">✕</button>
        {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
        <div>{children}</div>
      </div>
    </div>
  )
}
