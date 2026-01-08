import { describe, it, expect, beforeEach } from 'vitest'
import { createRoom, addPlayer, applyAction } from './game.js'

let room
beforeEach(()=>{
  room = createRoom('R1')
  addPlayer(room, 'Alice')
  addPlayer(room, 'Bob')
})

describe('server turn rules', ()=>{
  it('prevents drawing twice in a turn', ()=>{
    const r1 = applyAction(room, { type: 'DRAW_DECK', player: 'Alice' })
    expect(r1.ok).toBe(true)
    const r2 = applyAction(room, { type: 'DRAW_DECK', player: 'Alice' })
    expect(r2.error).toBeTruthy()
  })

  it('prevents discard before draw', ()=>{
    const r = applyAction(room, { type: 'DISCARD', player: 'Alice', cardId: room.players['Alice'].hand[0].id })
    expect(r.error).toBeTruthy()
  })

  it('prevents end turn before discard', ()=>{
    applyAction(room, { type: 'DRAW_DECK', player: 'Alice' })
    const r = applyAction(room, { type: 'END_TURN' })
    expect(r.error).toBeTruthy()
  })

  it('allows draw -> discard -> end turn and resets flags', ()=>{
    applyAction(room, { type: 'DRAW_DECK', player: 'Alice' })
    const discardId = room.players['Alice'].hand[0].id
    const dr = applyAction(room, { type: 'DISCARD', player: 'Alice', cardId: discardId })
    expect(dr.ok).toBe(true)
    const et = applyAction(room, { type: 'END_TURN' })
    expect(et.ok).toBe(true)
    expect(room.turnIndex).toBe(1)
    expect(room.turnState.hasDrawn).toBe(false)
    expect(room.turnState.hasDiscarded).toBe(false)
  })

  it('prevents drawing after discard', ()=>{
    applyAction(room, { type: 'DRAW_DECK', player: 'Alice' })
    const discardId = room.players['Alice'].hand[0].id
    applyAction(room, { type: 'DISCARD', player: 'Alice', cardId: discardId })
    const r = applyAction(room, { type: 'DRAW_DECK', player: 'Alice' })
    expect(r.error).toBeTruthy()
  })

  it('prevents closing without discard but allows after discard', ()=>{
    applyAction(room, { type: 'DRAW_DECK', player: 'Alice' })
    let r = applyAction(room, { type: 'CLOSE_ROUND', player: 'Alice' })
    expect(r.error).toBeTruthy()
    const discardId = room.players['Alice'].hand[0].id
    applyAction(room, { type: 'DISCARD', player: 'Alice', cardId: discardId })
    r = applyAction(room, { type: 'CLOSE_ROUND', player: 'Alice' })
    expect(r.ok).toBe(true)
    expect(room.lastRoundSummary).toBeTruthy()
  })
})
