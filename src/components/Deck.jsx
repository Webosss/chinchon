import React from 'react'
import Card from './Card'

export default function Deck({ count = 0, onDraw, disabled=false }){
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Card faceUp={false} onClick={onDraw} disabled={disabled} />
        <div className="absolute -right-2 -top-2 bg-slate-800 text-white text-xs rounded px-1">{count}</div>
      </div>
      <button onClick={onDraw} disabled={disabled} className={`text-xs px-3 py-1 rounded ${disabled ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-500'}`}>Robar</button>
    </div>
  )
}
