import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import Game from './pages/Game'

export default function App(){
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '')
  const [room, setRoom] = useState(null)
  const [ws, setWs] = useState(null)
  const [serverState, setServerState] = useState(null)

  // Conectar WS al montar la app
  useEffect(()=>{
    const defaultUrl = (typeof window !== 'undefined')
      ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`
      : 'ws://localhost:4000'
    const socket = new WebSocket(process.env.VITE_WS_URL || defaultUrl)
    socket.addEventListener('message', ev=>{
      try{
        const msg = JSON.parse(ev.data)
        if(msg.type === 'state') setServerState(msg.state)
      } catch(e){ console.error('invalid ws msg', e) }
    })
    setWs(socket)
    return ()=> socket.close()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {!room ? (
        <Home
          ws={ws}
          playerName={playerName}
          setPlayerName={(n)=>{setPlayerName(n); localStorage.setItem('playerName', n)}}
          onCreate={(r)=>setRoom(r)}
          onJoin={(r)=>setRoom(r)}
        />
      ) : (
        <Game ws={ws} serverState={serverState} roomId={room} playerName={playerName} onLeave={()=>setRoom(null)} />
      )}
    </div>
  )
}
