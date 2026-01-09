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

      <div className="w-full max-w-md glass rounded-3xl shadow-2xl p-6 md:p-8 animate-slideInUp relative z-10 border border-white/20">
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

        {/* Formulario centrado */}
        <div className="flex flex-col items-center justify-center gap-4 max-w-md mx-auto p-4">
          {/* Nombre input */}
          <div className="w-full">
            <label className="block text-center text-sm font-bold text-white/90 mb-2">
              👤 Tu nombre
            </label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Ej: Ana"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Crear partida button */}
          <button
            onClick={handleCreate}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            🎮 Crear partida nueva
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-2 w-full">
            <div className="flex-grow border-t border-white/30"></div>
            <span className="px-4 text-white/60 text-sm font-semibold">o únete a una</span>
            <div className="flex-grow border-t border-white/30"></div>
          </div>

          {/* Join code input */}
          <div className="w-full">
            <label className="block text-center text-sm font-bold text-white/90 mb-2">
              🔑 Código de la sala
            </label>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-xl font-bold tracking-wider uppercase"
            />
          </div>

          {/* Botones centrados */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
            <button
              onClick={handleJoin}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              ✅ Unirse a partida
            </button>
          </div>
        </div>

        {/* Status message */}
        {status && (
          <div className="mt-4 p-3 glass border-l-4 border-amber-400 text-white text-sm rounded-lg animate-slideInUp">
            {status}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-white/20">
          <p className="text-xs text-white/60 text-center">
            🌐 Conexión automática al servidor
          </p>
        </div>
      </div>
    </main>
  )
}
