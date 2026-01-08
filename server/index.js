import WebSocket, { WebSocketServer } from 'ws'
import { createRoom, addPlayer, removePlayer, applyAction } from './game.js'

const PORT = process.env.PORT || 4000
const wss = new WebSocketServer({ port: PORT })
console.log(`WebSocket server listening on ws://localhost:${PORT}`)

const rooms = new Map() // code -> room
const clients = new Map() // ws -> { name, room }

function broadcastRoom(room){
  const payload = JSON.stringify({ type: 'state', state: {
    id: room.id,
    players: room.players,
    order: room.order,
    deckCount: room.deck.length,
    discardCount: room.discard.length,
    turnIndex: room.turnIndex,
    round: room.round,
    closer: room.closer,
    lastRoundSummary: room.lastRoundSummary,
    turnState: room.turnState || { hasDrawn:false, hasDiscarded:false }
  }})
  for(const [ws, meta] of clients.entries()){
    if(meta.room === room.id && ws.readyState === WebSocket.OPEN) ws.send(payload)
  }
}

wss.on('connection', (ws)=>{
  console.log('client connected')
  clients.set(ws, { name: null, room: null })

  ws.on('message', message => {
    try{
      const msg = JSON.parse(message.toString())
      switch(msg.type){
        case 'create': {
          const { roomId, playerName } = msg.payload
          if(rooms.has(roomId)){
            ws.send(JSON.stringify({ type: 'error', message: 'Sala ya existe' }))
            break
          }
          const room = createRoom(roomId)
          rooms.set(roomId, room)
          addPlayer(room, playerName)
          clients.set(ws, { name: playerName, room: roomId })
          broadcastRoom(room)
          break
        }
        case 'join': {
          const { roomId, playerName } = msg.payload
          const room = rooms.get(roomId)
          if(!room){ ws.send(JSON.stringify({ type: 'error', message: 'Sala no encontrada' })); break }
          addPlayer(room, playerName)
          clients.set(ws, { name: playerName, room: roomId })
          broadcastRoom(room)
          break
        }
        case 'action': {
          const { roomId, action } = msg.payload
          const room = rooms.get(roomId)
          if(!room){ ws.send(JSON.stringify({ type:'error', message:'Sala no encontrada' })); break }
          const res = applyAction(room, action)
          if(res.error) ws.send(JSON.stringify({ type:'error', message: res.error }))
          broadcastRoom(room)
          break
        }
        default:
          ws.send(JSON.stringify({ type:'error', message: 'mensaje desconocido' }))
      }
    } catch(e){
      ws.send(JSON.stringify({ type:'error', message: 'invalid message' }))
    }
  })

  ws.on('close', ()=>{
    const meta = clients.get(ws)
    if(meta && meta.room && meta.name){
      const room = rooms.get(meta.room)
      if(room){
        removePlayer(room, meta.name)
        if(room.order.length === 0) rooms.delete(meta.room)
        else broadcastRoom(room)
      }
    }
    clients.delete(ws)
  })
})
