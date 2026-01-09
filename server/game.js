import { findBestMelds, scoreHand, isChinchon } from '../src/game/rules.js'

function makeDeck(){
  const suits = ['Oros','Copas','Espadas','Bastos']
  const ranks = [1,2,3,4,5,6,7,10,11,12]
  const deck = []
  suits.forEach(s=> ranks.forEach(r=> deck.push({ id: `${s}-${r}`, suit:s, rank:r })))
  return shuffle(deck)
}
function shuffle(a){ return a.sort(()=>Math.random()-0.5) }

export function createRoom(id){
  const deck = makeDeck()
  return {
    id,
    state: 'waiting',
    deck,
    discard: [],
    players: {}, // name -> { name, hand: [], points }
    order: [],
    turnIndex: 0,
    round: 1,
    closer: null,
    lastRoundSummary: null,
    // turno state: control de acciones por turno
    turnState: { hasDrawn: false, hasDiscarded: false }
  }
} 

function dealHands(room){
  const deck = room.deck
  for(const name of room.order){
    room.players[name] = room.players[name] || { name, points: room.players[name]?.points || 0 }
    room.players[name].hand = deck.splice(0,7)
  }
}

export function addPlayer(room, name){
  if(room.order.includes(name)) return
  room.order.push(name)
  room.players[name] = room.players[name] || { name, points: 0 }
  // Re-deal hands so every player has 7 (simple approach for now)
  room.deck = room.deck.concat(Object.values(room.players).flatMap(p=>p.hand || []))
  room.deck = shuffle(room.deck)
  dealHands(room)
  // ensure turnState exists
  room.turnState = room.turnState || { hasDrawn: false, hasDiscarded: false }
}

export function removePlayer(room, name){
  room.order = room.order.filter(n=>n!==name)
  delete room.players[name]
}

export function applyAction(room, action){
  // Very similar to client reducer but mutates room in place
  const type = action.type
  switch(type){
    case 'DRAW_DECK': {
      const player = action.player
      if(room.order[room.turnIndex] !== player) return { error: 'No es tu turno' }
      if(room.turnState.hasDrawn) return { error: 'Ya has robado en este turno' }
      if(room.turnState.hasDiscarded) return { error: 'Ya has descartado, no puedes robar' }
      if(room.deck.length === 0) return { error: 'El mazo está vacío' }
      const card = room.deck.shift()
      room.players[player].hand.push(card)
      room.turnState.hasDrawn = true
      if(room.state === 'waiting') room.state = 'playing'
      return { ok:true }
    }
    case 'DRAW_DISCARD': {
      const player = action.player
      if(room.order[room.turnIndex] !== player) return { error: 'No es tu turno' }
      if(room.turnState.hasDrawn) return { error: 'Ya has robado en este turno' }
      if(room.turnState.hasDiscarded) return { error: 'Ya has descartado, no puedes robar' }
      if(room.discard.length===0) return { error: 'No hay descarte' }
      const card = room.discard.pop()
      room.players[player].hand.push(card)
      room.turnState.hasDrawn = true
      if(room.state === 'waiting') room.state = 'playing'
      return { ok:true }
    }
    case 'DISCARD': {
      const { player, cardId } = action
      if(room.order[room.turnIndex] !== player) return { error: 'No es tu turno' }
      if(!room.turnState.hasDrawn) return { error: 'Debes robar antes de descartar' }
      if(room.turnState.hasDiscarded) return { error: 'Ya has descartado en este turno' }
      const hand = room.players[player].hand
      const idx = hand.findIndex(c=>c.id===cardId)
      if(idx === -1) return { error: 'Carta no encontrada en mano' }
      const [card] = hand.splice(idx,1)
      room.discard.push(card)
      room.turnState.hasDiscarded = true
      // ensure hand size is correct (7)
      if(room.players[player].hand.length !== 7) {
        // Not critical, but enforce by trimming/explaining
        // If more than 7, keep as is, if less, it's an error
        if(room.players[player].hand.length < 7) return { error: 'Error: la mano quedó con menos de 7 cartas' }
      }
      if(room.state === 'waiting') room.state = 'playing'
      return { ok:true }
    }
    case 'END_TURN': {
      if(!room.turnState.hasDiscarded) return { error: 'Debes descartar antes de terminar el turno' }
      room.turnIndex = (room.turnIndex+1) % room.order.length
      // reset turn flags for new turn
      room.turnState.hasDrawn = false
      room.turnState.hasDiscarded = false
      if(room.state === 'waiting') room.state = 'playing'
      return { ok:true }
    }
    case 'CLOSE_ROUND': {
      const closer = action.player
      if(room.order[room.turnIndex] !== closer) return { error: 'No puedes cerrar si no es tu turno' }
      if(!room.turnState.hasDiscarded) return { error: 'Debes haber descartado antes de cerrar' }
      const summary = {}
      let chinchonHappened = null
      for(const name of room.order){
        const p = room.players[name]
        const { points, melds, remaining } = scoreHand(p.hand)
        summary[name] = { points, melds, remaining }
        if(isChinchon(p.hand)) chinchonHappened = name
      }
      if(chinchonHappened){
        for(const name of room.order){
          if(name === chinchonHappened) room.players[name].points += 0
          else room.players[name].points += 40
        }
      } else {
        for(const name of room.order){
          room.players[name].points += summary[name].points
        }
      }
      room.closer = closer
      room.lastRoundSummary = { players: summary, chinchon: chinchonHappened, closer }
      if(room.state === 'waiting') room.state = 'playing'
      return { ok:true }
    }
    case 'FINISH_ROUND': {
      // new deck and deal
      room.deck = makeDeck()
      room.discard = []
      room.turnIndex = (room.turnIndex+1) % room.order.length
      for(const name of room.order){
        room.players[name].hand = room.deck.splice(0,7)
      }
      room.round += 1
      room.closer = null
      room.lastRoundSummary = null
      // reset turn flags
      room.turnState = { hasDrawn: false, hasDiscarded: false }
      if(room.state === 'waiting') room.state = 'playing'
      return { ok:true }
    }
    default:
      return { error: 'Acción desconocida' }
  }
}

export default {
  createRoom, addPlayer, removePlayer, applyAction
}
