import React, { useState, useEffect } from 'react'
import Home from './pages/Home'
import Game from './pages/Game'
import Toast from './components/Toast'

export default function App(){
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '')
  const [room, setRoom] = useState(null)
  const [ws, setWs] = useState(null)
  const [serverState, setServerState] = useState(null)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  // Conectar WS al montar la app
  useEffect(()=>{
    const defaultUrl = (typeof window !== 'undefined')
      ? `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`
      : 'ws://localhost:4000'
    const envWs = (typeof process !== 'undefined' && process.env && process.env.VITE_WS_URL) || import.meta.env?.VITE_WS_URL
    const socket = new WebSocket(envWs || defaultUrl)
    socket.addEventListener('message', ev=>{
      try{
        const msg = JSON.parse(ev.data)
        if(msg.type === 'state') setServerState(msg.state)
        else if(msg.type === 'error'){
          // Show short, player-oriented message without blocking the UI
          const shortMsg = msg.message || 'Error del servidor'
          setToastMessage(shortMsg)
          setToastVisible(true)
        }
      } catch(e){ console.error('invalid ws msg', e) }
    })
    setWs(socket)
    return ()=> socket.close()
  }, [])

  // Auto hide toast after a short interval so it doesn't block the flow
  useEffect(()=>{
    if(!toastVisible) return
    const t = setTimeout(()=> setToastVisible(false), 4000)
    return ()=> clearTimeout(t)
  }, [toastVisible])

  return (
    <div className="app-root min-h-screen bg-green-800 text-white antialiased">
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

      <Toast message={toastMessage} visible={toastVisible} onClose={()=>setToastVisible(false)} />
    </div>
  )
}
