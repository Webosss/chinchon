import React from 'react'

export default function Toast({ message, visible, onClose }){
  if(!visible) return null
  return (
    <div className="fixed right-6 bottom-6 z-50">
      <div className="bg-amber-400 text-slate-900 px-4 py-2 rounded shadow-lg flex items-center gap-3">
        <div className="font-medium">{message}</div>
        <button onClick={onClose} className="text-sm text-slate-700">Cerrar</button>
      </div>
    </div>
  )
}
