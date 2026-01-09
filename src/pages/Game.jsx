import React, { useEffect, useState } from 'react'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import Hand from '../components/Hand'
import Card from '../components/Card'
import DeckPile from '../components/DeckPile'
import DiscardPile from '../components/DiscardPile'
import { scoreHand, isPerfectChinchon } from '../game/rules';

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
  // - 7 cards in a run (perfect chinchón) = WIN GAME
  // - 7 cards matched (normal chinchón) = -10 points
  // - 6 cards matched + 1 card <= 5 = valid close
  const playerHand = state?.players?.[playerName]?.hand || []
  const { remaining } = scoreHand(playerHand)
  const perfectChinchon = isPerfectChinchon(playerHand) // Escalera de 7 = gana partida
  const normalChinchon = remaining.length === 0 && !perfectChinchon // 7 ligadas = -10 puntos
  const canCloseMeld = remaining.length === 0 || (remaining.length === 1 && (remaining[0]?.rank <= 5 || false))

  // Determine which actions are allowed based on turn state
  const canDraw = canAct && !turnState.hasDrawn
  const canDiscard = canAct && turnState.hasDrawn && !turnState.hasDiscarded
  const canEndTurn = canAct && turnState.hasDrawn && turnState.hasDiscarded
  const canClose = canAct && turnState.hasDrawn && turnState.hasDiscarded && canCloseMeld // MUST discard first AND have <= 5 points
  const canDeal = state?.state === 'finished' // Only when round is finished

  function handleAction(actionType, actionPayload) {
    // Check if action is allowed and show error if not
    const allowed = {
      'DRAW_DECK': canDraw,
      'DRAW_DISCARD': canDraw,
      'DISCARD': canDiscard,
      'END_TURN': canEndTurn,
      'CLOSE_ROUND': canClose,
      'FINISH_ROUND': canDeal
    }

    if (!allowed[actionType]) {
      let errorMsg = 'Acción no permitida'
      if (canAct) {
        if (actionType === 'DRAW_DECK' || actionType === 'DRAW_DISCARD') {
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
      } else {
        errorMsg = 'No es tu turno'
      }
      setToast({ message: `❌ ${errorMsg}`, visible: true })
      setTimeout(() => setToast({ message: '', visible: false }), 3000)
      return
    }

    sendAction({ type: actionType, ...actionPayload })
  }

  function sendAction(action) {
    if (!ws || ws.readyState !== WebSocket.OPEN) return
    ws.send(JSON.stringify({ type: 'action', payload: { roomId, action } }))
  }

  if(!state) return <div className="p-4 text-white">Conectando...</div>

  return (
    <div className="min-h-screen bg-gradient-game text-white flex flex-col animate-fadeIn">
      {/* HEADER */}
      <header className="glass border-b border-white/20 p-3 md:p-4 shadow-2xl backdrop-blur-md animate-slideInUp">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex flex-wrap gap-2 md:gap-4 items-center text-xs md:text-sm justify-center">
            <div className="glass px-2 md:px-3 py-1.5 rounded-lg">
              <span className="text-gray-300">🎲 Sala:</span> 
              <strong className="text-sm md:text-base ml-1 text-amber-400">{roomId}</strong>
            </div>
            <div className="glass px-2 md:px-3 py-1.5 rounded-lg">
              <span className="text-gray-300">🎯 Turno:</span> 
              <strong className="ml-1 text-green-300">{state.order[state.turnIndex]}</strong>
            </div>
            <div className="glass px-2 md:px-3 py-1.5 rounded-lg">
              <span className="text-gray-300">📊 Ronda:</span> 
              <strong className="ml-1">{state.round}</strong>
            </div>
            {stateLabel && (
              <div className="px-2 md:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-xs md:text-sm font-bold shadow-lg animate-pulse-soft">
                {stateLabel}
              </div>
            )}
          </div>
          <div className="flex gap-2 md:gap-3 items-center">
            <div className="text-xs md:text-sm glass px-2 md:px-3 py-1.5 rounded-lg">
              <span className="text-gray-300">👤</span> 
              <strong className="ml-1">{playerName}</strong>
            </div>
            <button
              onClick={onLeave}
              className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-xs md:text-sm font-bold transition-all transform hover:scale-105 shadow-lg btn-shine"
            >
              ✖ Salir
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT SIDEBAR: Players info */}
        <aside className="lg:w-64 bg-gradient-to-b from-green-900/50 to-green-950/50 glass border-r border-white/10 p-3 md:p-4 overflow-y-auto animate-slideInLeft">
          <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 text-amber-400 flex items-center gap-2">
            <span>👥</span> Jugadores
          </h3>
          <div className="space-y-2 md:space-y-3">
            {(state.order || []).map(name => {
              const isCurrentTurn = name === state.order[state.turnIndex]
              const isMe = name === playerName
              return (
                <div 
                  key={name} 
                  className={`glass rounded-lg p-2 md:p-3 transition-all scoreboard-item ${
                    isCurrentTurn ? 'ring-2 ring-green-400 shadow-lg shadow-green-400/50' : ''
                  } ${isMe ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isCurrentTurn && <span className="animate-pulse text-green-400">▶</span>}
                      <span className={`text-xs md:text-sm font-semibold ${isMe ? 'text-amber-400' : ''}`}>
                        {name} {isMe && '(Tú)'}
                      </span>
                    </div>
                    <span className="text-xs md:text-sm font-bold">
                      {state.players?.[name]?.hand?.length || 0} 🃏
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* CENTER: Tapete (table) */}
        <div className="flex-1 flex items-center justify-center p-2 md:p-4 overflow-hidden animate-fadeIn">
          <div className="w-full max-w-4xl tapete p-4 md:p-8 relative">
            {/* Decorative elements */}
            <div className="absolute top-4 left-4 text-white/10 text-4xl md:text-6xl animate-float">♠</div>
            <div className="absolute bottom-4 right-4 text-white/10 text-4xl md:text-6xl animate-float" style={{animationDelay: '1s'}}>♥</div>
            
            <div className="flex flex-col items-center justify-center min-h-full gap-6 md:gap-8">
              {/* Decks */}
              <div className="flex gap-6 md:gap-12 items-center justify-center">
                <div className="transform hover:scale-105 transition-transform">
                  <DeckPile
                    count={state.deckCount}
                    disabled={!canDraw}
                    onClick={() => handleAction('DRAW_DECK', { player: playerName })}
                    label="Mazo"
                  />
                </div>
                <div className="transform hover:scale-105 transition-transform">
                  <DiscardPile
                    cards={state.discardPile || []}
                    count={state.discardCount}
                    onClick={() => handleAction('DRAW_DISCARD', { player: playerName })}
                    label="Descarte"
                  />
                </div>
              </div>

              {/* Info text */}
              <div className="text-center text-white/70 text-xs md:text-sm glass px-3 md:px-4 py-2 rounded-lg">
                {canAct ? (
                  <span className="text-green-300 font-semibold animate-pulse-soft">
                    🎯 ¡Es tu turno!
                  </span>
                ) : (
                  <span>Esperando a {state.order[state.turnIndex]}...</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Scores */}
        <aside className="lg:w-64 bg-gradient-to-b from-amber-900/50 to-orange-950/50 glass border-l border-white/10 p-3 md:p-4 overflow-y-auto animate-slideInRight">
          <h3 className="text-sm md:text-base font-bold mb-3 md:mb-4 text-amber-400 flex items-center gap-2">
            <span>🏆</span> Puntuaciones
          </h3>
          <div className="space-y-2 md:space-y-3">
            {(state.order || []).map(name => {
              const points = state.players?.[name]?.points ?? 0
              const isMe = name === playerName
              return (
                <div 
                  key={name} 
                  className={`glass rounded-lg p-2 md:p-3 transition-all scoreboard-item ${
                    isMe ? 'ring-2 ring-amber-400' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs md:text-sm font-medium ${isMe ? 'text-amber-400' : ''}`}>
                      {name}
                    </span>
                    <span className={`text-base md:text-xl font-bold ${
                      points <= 0 ? 'text-green-400' : points < 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {points}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-1 md:mt-2 h-1 md:h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        points <= 0 ? 'bg-green-400' : points < 50 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.min(100, (points / 100) * 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </main>

      {/* HAND SECTION */}
      <div className="bg-gradient-to-t from-green-950 to-green-900/90 border-t-2 border-amber-500/50 p-2 md:p-4 shadow-2xl animate-slideInUp">
        <div className="max-w-7xl mx-auto">
          <div className="mb-2 md:mb-3 flex flex-col md:flex-row justify-between items-center gap-2">
            <h3 className="text-xs md:text-sm font-bold text-amber-400 flex items-center gap-2">
              <span>🃏</span> TU MANO
            </h3>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-1 md:gap-2 justify-center">
              <button
                onClick={() => handleAction('DRAW_DECK', { player: playerName })}
                disabled={!canDraw}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all transform hover:scale-105 btn-shine ${
                  canDraw
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white cursor-pointer shadow-lg'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                title={!canDraw ? 'Ya robaste una carta' : ''}
              >
                📥 Robar
              </button>
              <button
                onClick={() => handleAction('DRAW_DISCARD', { player: playerName })}
                disabled={!canDraw}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all transform hover:scale-105 btn-shine ${
                  canDraw
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white cursor-pointer shadow-lg'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                title={!canDraw ? 'Ya robaste una carta' : ''}
              >
                📤 Descarte
              </button>
              <button
                onClick={() => handleAction('END_TURN', {})}
                disabled={!canEndTurn}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all transform hover:scale-105 btn-shine ${
                  canEndTurn
                    ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white cursor-pointer shadow-lg'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                title={!canEndTurn ? 'Debes robar y descartar primero' : ''}
              >
                ✓ Terminar
              </button>
              <button
                onClick={() => handleAction('CLOSE_ROUND', { player: playerName })}
                disabled={!canClose}
                className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all transform hover:scale-105 btn-shine ${
                  canClose
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white cursor-pointer shadow-lg card-glow'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-50'
                }`}
                title={!canClose ? (
                  !turnState.hasDiscarded 
                    ? 'Primero debes descartar' 
                    : remaining.length > 1 
                      ? `Necesitas 6-7 ligadas (tienes ${remaining.length} sueltas)` 
                      : `Carta suelta debe ser ≤5 (tienes ${remaining[0]?.rank || '?'})`
                ) : perfectChinchon ? '¡CHINCHÓN PERFECTO! 🏆' : normalChinchon ? '¡Chinchón! -10 pts' : 'Cerrar ronda'}
              >
                {perfectChinchon ? '🏆 CHINCHÓN' : '🔒 Cerrar'}
              </button>
              {canDeal && (
                <button
                  onClick={() => handleAction('FINISH_ROUND', {})}
                  className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-xs md:text-sm font-bold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white cursor-pointer shadow-lg transition-all transform hover:scale-105 btn-shine"
                >
                  🃏 Repartir
                </button>
              )}
            </div>
          </div>
          
          <div className="glass rounded-lg p-2 md:p-3 overflow-x-auto">
            <Hand
              cards={state.players?.[playerName]?.hand || []}
              onDiscard={(cardId) => handleAction('DISCARD', { player: playerName, cardId })}
              canDiscard={canDiscard}
              onErrorMsg={(msg) => setToast({ message: msg, visible: true })}
            />
          </div>
        </div>
      </div>

      {/* MODAL */}
      {state.lastRoundSummary && (
        <Modal title={`🎯 Resumen Ronda ${state.round}`} onClose={() => sendAction({ type: 'FINISH_ROUND' })}>
          <div className="space-y-4">
            {state.lastRoundSummary.chinchon ? (
              <div className="text-amber-600 font-bold text-lg flex items-center gap-2 animate-pulse-soft">
                🏆 ¡Chinchón de {state.lastRoundSummary.chinchon}!
              </div>
            ) : (
              <div className="text-sm text-slate-600">Cierre por: <strong>{state.lastRoundSummary.closer}</strong></div>
            )}

            <div className="space-y-3">
              {Object.entries(state.lastRoundSummary.players).map(([name, s]) => (
                <div key={name} className="glass rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-base">{name}</span>
                    <span className={`text-xl font-bold ${
                      s.points <= 0 ? 'text-green-600' : s.points < 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {s.points} pts
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    <div>✅ Combinaciones: {s.melds.length}</div>
                    <div>❌ Sin combinar: {s.remaining.length > 0 ? s.remaining.map(r=>r.rank).join(', ') : 'Ninguna'}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t flex justify-end">
              <button 
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold transition-all transform hover:scale-105 btn-shine" 
                onClick={() => sendAction({ type: 'FINISH_ROUND' })}
              >
                🎮 Nueva ronda
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      <Toast 
        message={toast.message} 
        visible={toast.visible} 
        onClose={() => setToast({ message: '', visible: false })} 
      />
    </div>
  )
}
