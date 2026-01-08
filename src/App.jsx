import React, { useState } from 'react'
import Home from './pages/Home'
import Game from './pages/Game'

export default function App(){
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '')
  const [room, setRoom] = useState(null)

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!room ? (
        <Home
          playerName={playerName}
          setPlayerName={(n)=>{setPlayerName(n); localStorage.setItem('playerName', n)}}
          onCreate={(r)=>setRoom(r)}
          onJoin={(r)=>setRoom(r)}
        />
      ) : (
        <Game roomId={room} playerName={playerName} onLeave={()=>setRoom(null)} />
      )}
    </div>
  )
}
