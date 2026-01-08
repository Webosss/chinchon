// acciones: INIT, DRAW_DECK, DRAW_DISCARD, DISCARD, END_TURN
function makeDeck(){
  const suits = ['Oros','Copas','Espadas','Bastos']
  const ranks = [1,2,3,4,5,6,7,10,11,12] // 48 cartas
  const deck = []
  suits.forEach(s=>{
    ranks.forEach(r=> deck.push({ id: `${s}-${r}`, suit:s, rank:r }))
  })
  return shuffle(deck)
}
function shuffle(array){ return array.sort(()=>Math.random()-0.5) }

export const initialState = {
  deck: [], discard: [], players: {}, order: [], turnIndex: 0
}

export function gameReducer(state, action){
  switch(action.type){
    case 'INIT': {
      const deck = makeDeck()
      const players = {}
      action.players.forEach(p=>{
        players[p] = { name:p, hand: deck.splice(0,7), points: 0 }
      })
      return { ...state, deck, discard: [], players, order: action.players, turnIndex: 0 }
    }
    case 'DRAW_DECK': {
      const player = action.player
      if(state.deck.length === 0) return state
      const card = state.deck[0]
      const newDeck = state.deck.slice(1)
      const newPlayers = {...state.players, [player]: {...state.players[player], hand: [...state.players[player].hand, card]} }
      return {...state, deck: newDeck, players: newPlayers}
    }
    case 'DRAW_DISCARD': {
      const player = action.player
      if(state.discard.length === 0) return state
      const card = state.discard[state.discard.length-1]
      const newDiscard = state.discard.slice(0,-1)
      const newPlayers = {...state.players, [player]: {...state.players[player], hand: [...state.players[player].hand, card]} }
      return {...state, discard: newDiscard, players: newPlayers}
    }
    case 'DISCARD': {
      const { player, cardId } = action
      const hand = state.players[player].hand.filter(c=>c.id !== cardId)
      const newPlayers = {...state.players, [player]: {...state.players[player], hand} }
      return {...state, players: newPlayers, discard: [...state.discard, { id: cardId } ]}
    }
    case 'END_TURN': {
      return {...state, turnIndex: (state.turnIndex+1) % state.order.length}
    }
    default: return state
  }
}
