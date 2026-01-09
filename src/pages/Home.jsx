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
    <main className="min-h-screen bg-green-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-green-800 mb-2 text-center">🃏 Chinchón</h1>
        <p className="text-center text-gray-600 text-sm mb-6">Juego de cartas para 2-4 jugadores</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tu nombre</label>
            <input
              value={playerName}
              onChange={e => setPlayerName(e.target.value)}
              placeholder="Ej: Ana"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:border-green-600 transition"
            />
          </div>

          <button
            onClick={handleCreate}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
          >
            🎮 Crear partida
          </button>

          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-3 text-gray-500 text-sm">o</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Código de la sala</label>
            <input
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-center font-mono text-lg focus:outline-none focus:border-green-600 transition"
            />
          </div>

          <button
            onClick={handleJoin}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-lg transition-colors shadow-md"
          >
            ✅ Unirse a partida
          </button>
        </div>

        {status && (
          <div className="mt-4 p-3 bg-amber-100 border-l-4 border-amber-600 text-amber-800 text-sm rounded">
            {status}
          </div>
        )}

        <p className="mt-6 text-xs text-gray-500 text-center">
          Asegúrate de iniciar el servidor con <code className="bg-gray-100 px-1 rounded">npm run start:server</code>
        </p>
      </div>
    </main>
  )
}
