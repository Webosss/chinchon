import React, { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import Toast from '../components/Toast'

export default function Game({ ws, serverState, roomId, playerName, onLeave }){
  const [state, setState] = useState(null)
  const [toast, setToast] = useState({ message: '', visible: false })

  useEffect(()=>{
    if(serverState && serverState.id === roomId) setState(serverState)
  }, [serverState, roomId])

  useEffect(()=>{
    if(state && state.lastRoundSummary){
      const { chinchon } = state.lastRoundSummary
      if(chinchon){
        setToast({ message: `¡Chinchón de ${chinchon}!`, visible: true })
        setTimeout(()=> setToast({ message:'', visible:false }), 4000)
      }
    }
  }, [state?.lastRoundSummary])

  const turn = state?.order?.[state?.turnIndex]
  const canAct = turn === playerName

  function sendAction(action){
    if(!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: 'action', payload: { roomId, action } }))
  }

  if(!state) return <div className="p-4">Conectando... esperando estado de la sala</div>

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold">Sala {roomId}</h2>
          <p className="text-sm text-slate-600">Turno: <strong>{state.order[state.turnIndex]}</strong></p>
          <p className="text-sm">Ronda: {state.round}</p>
        </div>
        <div className="text-right">
          <p>{playerName}</p>
          <button onClick={onLeave} className="text-sm text-red-600">Salir</button>
        </div>
      </header>

      <section className="flex gap-6">
        <div className="w-1/3">
          <div className="mb-4">
            <button className="w-full bg-green-600 text-white py-2 rounded" onClick={()=>sendAction({type:'DRAW_DECK', player: playerName})} disabled={!canAct}>Robar del mazo</button>
            <button className="w-full mt-2 bg-amber-400 py-2 rounded" onClick={()=>sendAction({type:'DRAW_DISCARD', player: playerName})} disabled={!canAct}>Robar del descarte</button>
            <button className="w-full mt-4 bg-red-600 text-white py-2 rounded" onClick={()=>sendAction({type:'CLOSE_ROUND', player: playerName})} disabled={!canAct}>Cerrar</button>
          </div>
          <div className="text-sm">Mazo: {state.deckCount} cartas</div>
          <div className="text-sm">Descarte: {state.discardCount}</div>
          <div className="mt-3">
            <div className="text-sm font-semibold">Puntos acumulados</div>
            {(state.order || []).map(name => (
              <div key={name} className="text-sm">{name}: {state.players?.[name]?.points ?? 0}</div>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <h3 className="font-semibold mb-2">Tu mano</h3>
          <div className="flex flex-wrap gap-2">
            {(state.players?.[playerName]?.hand || []).map(c=>(
              <button key={c.id} className="border rounded px-3 py-2 bg-white" onClick={()=>sendAction({type:'DISCARD', player: playerName, cardId: c.id})} disabled={!canAct}>
                {c.suit} {c.rank}
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            <button className="bg-slate-200 px-3 py-2 rounded" onClick={()=>sendAction({type:'END_TURN'})} disabled={!canAct}>Terminar turno</button>
            <button className="bg-blue-600 text-white px-3 py-2 rounded" onClick={()=>sendAction({type:'FINISH_ROUND'})}>Repartir / Nueva ronda</button>
          </div>

        </div>
      </section>

      {/* Modal con resumen detallado */}
      {state.lastRoundSummary && (
        <Modal title={`Resumen Ronda ${state.round}`} onClose={()=>sendAction({type:'FINISH_ROUND'})}>
          <div className="space-y-3">
            {state.lastRoundSummary.chinchon ? (
              <div className="text-amber-600 font-semibold">¡Chinchón de {state.lastRoundSummary.chinchon}!</div>
            ) : (
              <div className="text-sm text-slate-600">Cierre por: {state.lastRoundSummary.closer}</div>
            )}

            <div className="mt-2">
              {Object.entries(state.lastRoundSummary.players).map(([name, s]) => (
                <div key={name} className="mb-3">
                  <div className="font-medium">{name} — {s.points} puntos</div>
                  <div className="text-xs text-slate-600">Melds: {s.melds.length} — No combinadas: {s.remaining.map(r=>r.id).join(', ') || '0'}</div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t flex justify-end gap-3">
              <button className="px-3 py-2 rounded bg-slate-200" onClick={()=>sendAction({type:'FINISH_ROUND'})}>Nueva ronda</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast */}
      <Toast message={toast.message} visible={toast.visible} onClose={()=>setToast({message:'', visible:false})} />
    </div>
  )
}
