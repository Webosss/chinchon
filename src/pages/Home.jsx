import React, { useState } from 'react'

function makeCode(){
  return Math.random().toString(36).slice(2,8).toUpperCase()
}

export default function Home({ playerName, setPlayerName, onCreate, onJoin }){
  const [joinCode, setJoinCode] = useState('')

  return (
    <main className="max-w-lg mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Chinchón - Sala privada</h1>

      <label className="block mb-3">
        <span className="text-sm">Tu nombre</span>
        <input value={playerName} onChange={e=>setPlayerName(e.target.value)}
               className="mt-1 w-full border rounded px-3 py-2" placeholder="Ej: Ana" />
      </label>

      <div className="flex gap-3 mb-4">
        <button onClick={()=>onCreate(makeCode())}
                className="flex-1 bg-indigo-600 text-white rounded py-2">Crear partida</button>
        <input className="w-36 border rounded px-2" value={joinCode}
               onChange={e=>setJoinCode(e.target.value.toUpperCase())} placeholder="Código" />
        <button onClick={()=>onJoin(joinCode)} className="bg-slate-200 px-3 rounded">Unirse</button>
      </div>

      <p className="text-sm text-slate-600">Nota: ahora mismo las salas son locales (sin backend). Úsalas en la misma máquina o espera la próxima fase con WebSocket.</p>
    </main>
  )
}
