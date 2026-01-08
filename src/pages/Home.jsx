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
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Chinchón - Sala privada</h1>

      <label className="block mb-3">
        <span className="text-sm">Tu nombre</span>
        <input value={playerName} onChange={e=>setPlayerName(e.target.value)}
               className="mt-1 w-full border rounded px-3 py-2" placeholder="Ej: Ana" />
      </label>

      <div className="flex gap-3 mb-4">
        <button onClick={handleCreate}
                className="flex-1 bg-indigo-600 text-white rounded py-2">Crear partida</button>
        <input className="w-36 border rounded px-2" value={joinCode}
               onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="Código" />
        <button onClick={handleJoin} className="bg-slate-200 px-3 rounded">Unirse</button>
      </div>

      {status && <div className="text-sm text-amber-600">{status}</div>}

      <p className="text-sm text-slate-600">Nota: las salas usan WebSocket en el servidor. Asegúrate de iniciar el servidor con <code>npm run start:server</code>.</p>
    </main>
  )
}
