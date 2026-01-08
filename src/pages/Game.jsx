import React, { useReducer, useEffect } from 'react'
import { gameReducer, initialState } from '../game/reducer'

export default function Game({ roomId, playerName, onLeave }){
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(()=>{
    // Inicializamos con el creador y un bot para pruebas
    dispatch({ type: 'INIT', players: [playerName || 'Jugador1', 'Jugador2'] })
  }, [roomId])

  const me = state.players[playerName] || state.players['Jugador1']
  const turn = state.order[state.turnIndex]

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Sala {roomId}</h2>
          <p className="text-sm text-slate-600">Turno: <strong>{turn}</strong></p>
        </div>
        <div className="text-right">
          <p>{playerName}</p>
          <button onClick={onLeave} className="text-sm text-red-600">Salir</button>
        </div>
      </header>

      <section className="flex gap-6">
        <div className="w-1/3">
          <div className="mb-4">
            <button className="w-full bg-green-600 text-white py-2 rounded" onClick={()=>dispatch({type:'DRAW_DECK', player: playerName || 'Jugador1'})}>Robar del mazo</button>
            <button className="w-full mt-2 bg-amber-400 py-2 rounded" onClick={()=>dispatch({type:'DRAW_DISCARD', player: playerName || 'Jugador1'})}>Robar del descarte</button>
          </div>
          <div className="text-sm">Mazo: {state.deck.length} cartas</div>
          <div className="text-sm">Descarte: {state.discard.length}</div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold mb-2">Tu mano</h3>
          <div className="flex flex-wrap gap-2">
            {(me?.hand || []).map(c=>(
              <button key={c.id} className="border rounded px-3 py-2 bg-white" onClick={()=>dispatch({type:'DISCARD', player: playerName || 'Jugador1', cardId: c.id})}>
                {c.suit} {c.rank}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <button className="bg-slate-200 px-3 py-2 rounded" onClick={()=>dispatch({type:'END_TURN'})}>Terminar turno</button>
          </div>
        </div>
      </section>
    </div>
  )
}
