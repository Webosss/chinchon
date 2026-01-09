import React, { useState } from 'react'

function makeCode(){
  return Math.random().toString(36).slice(2,8).toUpperCase()
}

export default function Home({ ws, playerName, setPlayerName, onCreate, onJoin }){
  const [joinCode, setJoinCode] = useState('')
  const [status, setStatus] = useState('')

  function handleCreate(){
    const code = makeCode()
    if(!ws || ws.readyState !== WebSocket.OPEN){ setStatus('Conectando... espera'); return }
    ws.send(JSON.stringify({ type: 'create', payload: { roomId: code, playerName } }))
    onCreate(code)
  }

  function handleJoin(){
    if(!joinCode) return setStatus('Introduce un código')
    if(!ws || ws.readyState !== WebSocket.OPEN){ setStatus('Conectando... espera'); return }
    ws.send(JSON.stringify({ type: 'join', payload: { roomId: joinCode, playerName } }))
    onJoin(joinCode)
  }

  return (
    <main className="min-h-screen bg-gradient-game flex items-center justify-center p-4 animate-fadeIn relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-white/5 text-9xl animate-float">♠</div>
        <div className="absolute bottom-20 right-20 text-white/5 text-9xl animate-float" style={{animationDelay: '1s'}}>♥</div>
        <div className="absolute top-1/2 left-1/4 text-white/5 text-9xl animate-float" style={{animationDelay: '2s'}}>♦</div>
        <div className="absolute bottom-1/3 right-1/3 text-white/5 text-9xl animate-float" style={{animationDelay: '0.5s'}}>♣</div>
      </div>

      <div className="w-full max-w-md mx-auto glass rounded-3xl shadow-2xl p-6 md:p-8 animate-slideInUp relative z-10 border border-white/20">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-block animate-pulse-soft mb-3">
            <span className="text-6xl md:text-7xl">🃏</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 mb-2">
            Chinchón
          </h1>
          <p className="text-white/80 text-sm md:text-base">
            Juego de cartas español • 2-4 jugadores
          </p>
        </div>

        <div className="space-y-4 md:space-y-5">
          {/* Nombre input */}
          <div>
            <label className="block text-sm font-bold text-white/90 mb-2 flex items-center justify-center gap-2">
              <span>👤</span> Tu nombre
            </label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Ej: Ana"
              className="w-full glass border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all text-base"
            />
          </div>

          {/* Crear partida button */}
          <button
            onClick={handleCreate}
            className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white font-bold py-3 md:py-4 rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl btn-shine text-base md:text-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🎮</span> Crear partida nueva
            </span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-3 md:py-4">
            <div className="flex-grow border-t border-white/30"></div>
            <span className="px-4 text-white/60 text-sm font-semibold">o únete a una</span>
            <div className="flex-grow border-t border-white/30"></div>
          </div>

          {/* Join code input */}
          <div>
            <label className="block text-sm font-bold text-white/90 mb-2 flex items-center justify-center gap-2">
              <span>🔑</span> Código de la sala
            </label>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full glass border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder-white/50 text-center font-mono text-xl md:text-2xl font-bold tracking-wider focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50 transition-all uppercase"
            />
          </div>

          {/* Unirse button */}
          <button
            onClick={handleJoin}
            className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:from-amber-600 hover:via-orange-600 hover:to-orange-700 text-white font-bold py-3 md:py-4 rounded-xl transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl btn-shine text-base md:text-lg"
          >
            <span className="flex items-center justify-center gap-2">
              <span>✅</span> Unirse a partida
            </span>
          </button>
        </div>

        {/* Status message */}
        {status && (
          <div className="mt-4 md:mt-5 p-3 md:p-4 glass border-l-4 border-amber-400 text-white text-sm md:text-base rounded-lg animate-slideInUp">
            {status}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/20">
          <p className="text-xs md:text-sm text-white/60 text-center">
            🌐 Conexión automática al servidor
          </p>
        </div>
      </div>
    </main>
  )
}
