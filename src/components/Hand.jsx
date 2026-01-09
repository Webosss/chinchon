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
    <div className="flex gap-3 items-end overflow-x-auto py-4">
      {cards.map(c=> (
        <div key={c.id} className="flex flex-col items-center">
          <Card suit={c.suit} rank={c.rank} onClick={()=>handleClick(c)} disabled={!canDiscard} selected={selected === c.id} />
          <div className="text-xs text-slate-600 mt-1 text-black">{c.suit} {c.rank}</div>
        </div>
      ))}
    </div>
  )
}
