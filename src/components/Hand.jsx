import React, { useState } from 'react'
import Card from './Card'

export default function Hand({ cards = [], onDiscard, canAct = false, canDiscard = false, onErrorMsg = null }){
  const [selected, setSelected] = useState(null)

  function handleClick(card){
    if(!canDiscard) {
      if(onErrorMsg) onErrorMsg('❌ Primero debes robar una carta')
      return
    }
    // single-click to discard (keeps UX simple and matches E2E expectations)
    onDiscard && onDiscard(card.id)
    setSelected(null)
  }

  return (
    <div className="flex gap-2 md:gap-3 items-end overflow-x-auto py-2 md:py-4 px-1">
      {cards.map((c, index)=> (
        <div 
          key={c.id} 
          className="flex flex-col items-center transform transition-all"
          style={{
            animationDelay: `${index * 0.05}s`,
            animation: 'slideInUp 0.4s ease-out'
          }}
        >
          <Card 
            suit={c.suit} 
            rank={c.rank} 
            onClick={()=>handleClick(c)} 
            disabled={!canDiscard} 
            selected={selected === c.id}
            size="w-16 h-24 md:w-20 md:h-30 lg:w-24 lg:h-36"
          />
          <div className="text-[10px] md:text-xs text-white/60 mt-1 font-medium">
            {c.suit} {c.rank}
          </div>
        </div>
      ))}
      {cards.length === 0 && (
        <div className="w-full text-center py-8 text-white/50 text-sm">
          No tienes cartas
        </div>
      )}
    </div>
  )
}
