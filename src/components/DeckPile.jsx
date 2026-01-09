import React from 'react'
import Card from './Card'

export default function DeckPile({ count = 0, onClick, disabled = false, label = 'Mazo' }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {/* Show card back using Card component */}
      <Card
        suit="oros"
        rank={1}
        faceUp={false}
        onClick={onClick}
        disabled={disabled}
        size="w-24 h-36"
      />
      <div className="text-center">
        <div className="text-xs font-semibold text-white bg-green-900 px-2 py-1 rounded-full">
          {count}
        </div>
        <div className="text-xs text-white mt-1">{label}</div>
      </div>
    </div>
  )
}
