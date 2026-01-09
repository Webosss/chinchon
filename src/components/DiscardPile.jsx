import React from 'react'
import Card from './Card'

export default function DiscardPile({ cards = [], count = 0, onClick, label = 'Descarte' }) {
  // Get the last card (top of discard pile)
  const topCard = cards.length > 0 ? cards[cards.length - 1] : null

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className="relative w-24 h-36 rounded-lg shadow-xl transition-transform hover:scale-105 cursor-pointer"
      >
        {topCard ? (
          <Card suit={topCard.suit} rank={topCard.rank} faceUp={true} onClick={() => {}} disabled={false} size="w-24 h-36" />
        ) : (
          <div className="w-full h-full bg-green-900/30 rounded-lg border-2 border-dashed border-white/30 flex items-center justify-center">
            <div className="text-white/40 text-sm">Vacío</div>
          </div>
        )}
      </button>
      <div className="text-center">
        <div className="text-xs font-semibold text-white bg-green-900 px-2 py-1 rounded-full">
          {count}
        </div>
        <div className="text-xs text-white mt-1">{label}</div>
      </div>
    </div>
  )
}
