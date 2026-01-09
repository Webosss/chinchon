import React, { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Hand from '../components/Hand'
import Card from '../components/Card'
import DeckPile from '../components/DeckPile'
import DiscardPile from '../components/DiscardPile'
import { scoreHand } from '../game/rules'

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
  const turnState = state?.turnState || { hasDrawn: false, hasDiscarded: false }

  const stateLabel = state?.state === 'waiting' ? 'Esperando' : state?.state === 'playing' ? 'En juego' : state?.state === 'finished' ? 'Finalizada' : ''

  // Calculate if player can close: 
  // - 7 cards matched (chinchón) = -10 points
  // - 6 cards matched + 1 card <= 5 = valid close
  const playerHand = state?.players?.[playerName]?.hand || []
  const { remaining } = scoreHand(playerHand)
  const isChinchon = remaining.length === 0
  const canCloseMeld = isChinchon || (remaining.length === 1 && (remaining[0]?.rank <= 5 || false))

  // Determine which actions are allowed based on turn state
  const canDraw = canAct && !turnState.hasDrawn
  const canDiscard = canAct && turnState.hasDrawn && !turnState.hasDiscarded
  const canEndTurn = canAct && turnState.hasDrawn && turnState.hasDiscarded
  const canClose = canAct && turnState.hasDrawn && turnState.hasDiscarded && canCloseMeld // MUST discard first AND have <= 5 points
  const canDeal = state?.state === 'finished' // Only when round is finished

  function handleAction(actionType, actionPayload) {
    // Check if action is allowed and show error if not
    const actionRules = {
      'DRAW_DECK': canDraw,
      'DRAW_DISCARD': canDraw,
      'DISCARD': canDiscard,
      'END_TURN': canEndTurn,
      'CLOSE_ROUND': canClose,
      'FINISH_ROUND': canDeal
    }

    if (!actionRules[actionType]) {
      let errorMsg = 'Acción no permitida'
      
      if (!canAct) {
        errorMsg = 'No es tu turno'
      } else if (actionType === 'DRAW_DECK' || actionType === 'DRAW_DISCARD') {
        errorMsg = 'Ya has robado una carta'
      } else if (actionType === 'DISCARD') {
        errorMsg = 'Primero debes robar una carta'
      } else if (actionType === 'END_TURN') {
        errorMsg = 'Primero debes descartar una carta'
      } else if (actionType === 'CLOSE_ROUND') {
        if (!turnState.hasDiscarded) {
          errorMsg = 'Primero debes descartar una carta'
        } else if (remaining.length > 1) {
          errorMsg = `❌ Debes tener 6-7 cartas ligadas (tienes ${remaining.length} sin ligar)`
        } else if (remaining.length === 1 && remaining[0]?.rank > 5) {
          errorMsg = `❌ La carta suelta debe valer ≤ 5 (tienes ${remaining[0].rank})`
        } else {
          errorMsg = 'No puedes cerrar en este momento'
        }
      }
      
      setToast({ message: `❌ ${errorMsg}`, visible: true })
      setTimeout(() => setToast({ message: '', visible: false }), 3000)
      return
    }

    sendAction({ type: actionType, ...actionPayload })
  }

  function sendAction(action){
    if(!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: 'action', payload: { roomId, action } }))
  }

  if(!state) return <div className="p-4 text-white">Conectando...</div>

  return (
    <div className="min-h-screen bg-green-800 text-white flex flex-col">
      {/* TOP HEADER: Compact info bar */}
      <header className="bg-green-900 border-b-2 border-green-700 p-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex gap-6 items-center text-sm">
            <div>
              <span className="text-gray-300">Sala:</span> <strong className="text-lg">{roomId}</strong>
            </div>
            <div>
              <span className="text-gray-300">Turno:</span> <strong>{state.order[state.turnIndex]}</strong>
            </div>
            <div>
              <span className="text-gray-300">Ronda:</span> <strong>{state.round}</strong>
            </div>
            {stateLabel && (
              <div className="px-2 py-1 rounded bg-amber-500 text-sm font-semibold">
                {stateLabel}
              </div>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-sm">
              <span className="text-gray-300">Eres:</span> <strong>{playerName}</strong>
            </div>
            <button
              onClick={onLeave}
              className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-sm font-semibold transition"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT: Tapete + mano */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* TAPETE SECTION: Center green table with decks */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="w-full max-w-5xl bg-green-700 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center min-h-96 tapete">
            {/* Score board: top of tapete */}
            <div className="w-full mb-6 flex justify-between text-xs text-white/70 font-semibold">
              <div>Puntos</div>
              <div>Turno: {state.order[state.turnIndex]}</div>
            </div>

            {/* DECKS: Mazo + Descarte centered horizontally */}
            <div className="flex gap-12 items-end justify-center">
              <DeckPile
                count={state.deckCount}
                disabled={!canAct}
                onClick={() => sendAction({ type: 'DRAW_DECK', player: playerName })}
                label="Mazo"
              />
              <DiscardPile
                cards={state.discardPile || []}
                count={state.discardCount}
                onClick={() => sendAction({ type: 'DRAW_DISCARD', player: playerName })}
                label="Descarte"
              />
            </div>

            {/* Scoreboard: bottom info on tapete */}
            <div className="w-full mt-8 pt-6 border-t border-white/20">
              <div className="grid grid-cols-2 gap-4 text-xs text-white/80">
                {(state.order || []).map(name => (
                  <div key={name} className="flex justify-between">
                    <span>{name}:</span>
                    <strong>{state.players?.[name]?.points ?? 0}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MANO SECTION: Bottom player hand */}
        <div className="bg-green-900 border-t-2 border-green-700 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-300">TU MANO</h3>
              <div className="flex gap-2">
                {/* Action buttons: near hand */}
                <button
                  onClick={() => handleAction('DRAW_DECK', { player: playerName })}
                  disabled={!canDraw}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    canDraw
                      ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!canDraw ? 'Ya robaste una carta' : ''}
                >
                  📥 Robar mazo
                </button>
                <button
                  onClick={() => handleAction('DRAW_DISCARD', { player: playerName })}
                  disabled={!canDraw}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    canDraw
                      ? 'bg-amber-500 hover:bg-amber-600 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!canDraw ? 'Ya robaste una carta' : ''}
                >
                  📤 Robar descarte
                </button>
                <button
                  onClick={() => handleAction('END_TURN', {})}
                  disabled={!canEndTurn}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    canEndTurn
                      ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!canEndTurn ? 'Debes robar y descartar primero' : ''}
                >
                  ✓ Terminar turno
                </button>
                <button
                  onClick={() => handleAction('CLOSE_ROUND', { player: playerName })}
                  disabled={!canClose}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    canClose
                      ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!canClose ? (
                    !turnState.hasDiscarded 
                      ? 'Primero debes descartar' 
                      : remaining.length > 1 
                        ? `Necesitas 6-7 ligadas (tienes ${remaining.length} sueltas)` 
                        : `Carta suelta debe ser ≤5 (tienes ${remaining[0]?.rank || '?'})`
                  ) : isChinchon ? '¡Chinchón! (7 cartas ligadas = -10 puntos)' : 'Cerrar ronda'}
                >
                  🔒 Cerrar
                </button>
                <button
                  onClick={() => handleAction('FINISH_ROUND', {})}
                  disabled={!canDeal}
                  className={`px-3 py-1 rounded text-sm font-semibold transition ${
                    canDeal
                      ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                  title={!canDeal ? 'Solo cuando la ronda termina' : ''}
                >
                  🃏 Repartir
                </button>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 overflow-x-auto">
              <Hand
                cards={state.players?.[playerName]?.hand || []}
                onDiscard={(cardId) => handleAction('DISCARD', { player: playerName, cardId })}
                canDiscard={canDiscard}
                onErrorMsg={(msg) => setToast({ message: msg, visible: true })}
              />
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: Round summary */}
      {state.lastRoundSummary && (
        <Modal title={`Resumen Ronda ${state.round}`} onClose={() => sendAction({ type: 'FINISH_ROUND' })}>
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
              <button className="px-3 py-2 rounded bg-slate-200" onClick={() => sendAction({ type: 'FINISH_ROUND' })}>Nueva ronda</button>
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      <Toast message={toast.message} visible={toast.visible} onClose={() => setToast({ message: '', visible: false })} />
    </div>
  )
}
