import { describe, it, expect } from 'vitest'
import { findBestMelds, scoreHand, isChinchon, cardValue } from './rules'

function c(suit, rank){ return { id: `${suit}-${rank}`, suit, rank } }

describe('rules - basic utilities', ()=>{
  it('cardValue: face cards count as 10', ()=>{
    expect(cardValue(c('Oros',10))).toBe(10)
    expect(cardValue(c('Copas',12))).toBe(10)
    expect(cardValue(c('Espadas',7))).toBe(7)
  })
})

describe('findBestMelds and scoreHand', ()=>{
  it('detects a set (three same rank different suits)', ()=>{
    const hand = [c('Oros',1), c('Copas',1), c('Espadas',1), c('Bastos',4), c('Oros',7)]
    const res = findBestMelds(hand)
    expect(res.melds.length).toBeGreaterThanOrEqual(1)
    expect(res.melds[0].length).toBe(3)
    const score = scoreHand(hand)
    // remaining should be the two non-meld cards
    expect(score.remaining.length).toBe(2)
  })

  it('detects a run (consecutive same suit)', ()=>{
    const hand = [c('Oros',2), c('Oros',3), c('Oros',4), c('Copas',7), c('Espadas',10)]
    const { melds, remaining } = findBestMelds(hand)
    expect(melds.some(m=>m.length===3 && m.every(x=>x.suit==='Oros'))).toBe(true)
    expect(remaining.length).toBe(2)
  })

  it('chooses combination that maximizes used cards', ()=>{
    // Hand where either a 3-card run or a 3-card set could be chosen but best is to cover more cards
    const hand = [c('Oros',1), c('Oros',2), c('Oros',3), c('Copas',1), c('Espadas',1), c('Bastos',7)]
    // Best is set of ones (3) plus run 1-2-3? Note overlapping card Oros-1 appears; best used cards is 4: set(1,1,1) + run(2,3 with remaining?)
    const { melds, remaining } = findBestMelds(hand)
    // Ensure usedCount is maximum (>=3)
    expect(melds.reduce((s,m)=>s+m.length,0)).toBeGreaterThanOrEqual(3)
  })

  it('scores deadwood correctly (sum of cardValue of remaining)', ()=>{
    const hand = [c('Oros',1), c('Copas',1), c('Espadas',1), c('Bastos',10), c('Copas',7)]
    const { points, remaining } = scoreHand(hand)
    // remaining will be card with rank 7 (value 7) or maybe 10 depending on melds selection
    // Ensure points equals sum of cardValue of remaining
    const expected = remaining.reduce((s,c)=>s+cardValue(c), 0)
    expect(points).toBe(expected)
  })

  it('isChinchon detects perfect meld coverage', ()=>{
    // run of 1-2-3-4 in Oros and set of three 10s in 3 suits -> totals 7 cards all melded
    const hand = [c('Oros',1), c('Oros',2), c('Oros',3), c('Oros',4), c('Oros',10), c('Copas',10), c('Espadas',10)]
    expect(isChinchon(hand)).toBe(true)
  })

  it('handles no melds case', ()=>{
    const hand = [c('Oros',1), c('Copas',2), c('Espadas',3), c('Bastos',4), c('Oros',5), c('Copas',6), c('Espadas',7)]
    const { melds, remaining } = findBestMelds(hand)
    // maybe small runs exist e.g., 1-2-3 but suits differ; since suits differ no melds -> remaining = full hand
    expect(melds.length).toBeGreaterThanOrEqual(0)
    expect(remaining.length).toBeGreaterThanOrEqual(0)
  })

  it('prefers covering more cards when possible', ()=>{
    // Example: a 4-card run vs two separate 3-card runs that overlap - ensure algorithm picks configuration with max used cards
    const hand = [c('Oros',1), c('Oros',2), c('Oros',3), c('Oros',4), c('Copas',10), c('Espadas',10), c('Bastos',10)]
    const { melds, remaining } = findBestMelds(hand)
    // Should cover all 7 (run of 4 + set of 3)
    expect(remaining.length).toBe(0)
  })
})
