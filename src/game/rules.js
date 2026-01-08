// Helpers para detectar combinaciones (sets y runs) y calcular puntuación

const ORDERED_RANKS = [1,2,3,4,5,6,7,10,11,12]
const RANK_INDEX = new Map(ORDERED_RANKS.map((r,i)=>[r,i]))

export function cardValue(card){
  // Valores: 1-7 => su valor, 10-12 => 10 puntos cada una
  return card.rank >= 10 ? 10 : card.rank
}

function isSet(cards){
  if(cards.length < 3) return false
  const rank = cards[0].rank
  return cards.every(c=>c.rank === rank) && new Set(cards.map(c=>c.suit)).size === cards.length
}

function isRun(cards){
  if(cards.length < 3) return false
  const suit = cards[0].suit
  if(!cards.every(c=>c.suit === suit)) return false
  const indices = cards.map(c=>RANK_INDEX.get(c.rank)).sort((a,b)=>a-b)
  for(let i=1;i<indices.length;i++){
    if(indices[i] !== indices[i-1]+1) return false
  }
  return true
}

function isValidMeld(cards){
  return isSet(cards) || isRun(cards)
}

// Dado un array de cartas (hand), encuentra la forma de agruparlas en melds
// que maximiza el número de cartas incluidas en melds. Devuelve:
// { melds: [ [cards], ... ], remaining: [cards] }
export function findBestMelds(hand){
  // Hand is array of card objects with id,suit,rank
  const n = hand.length
  let best = { usedCount:0, melds:[], remaining: hand }

  // Backtracking: try to pick all subsets as melds
  function helper(remaining, currentMelds){
    // Try all subsets of remaining of size >=3
    let progressed = false
    const m = remaining.length
    // To keep time reasonable, generate combinations of sizes 3..m
    for(let size=3; size<=m; size++){
      // generate combinations (simple recursive comb generator)
      const comb = (start, arr)=>{
        if(arr.length === size){
          if(isValidMeld(arr)){
            const newRem = remaining.filter(r=>!arr.includes(r))
            helper(newRem, [...currentMelds, arr])
            progressed = true
          }
          return
        }
        for(let i=start;i<remaining.length;i++) comb(i+1, arr.concat(remaining[i]))
      }
      comb(0, [])
    }

    if(!progressed){
      const used = currentMelds.reduce((s,a)=>s+a.length,0)
      if(used > best.usedCount){
        best = { usedCount: used, melds: currentMelds, remaining }
      }
    }
  }

  helper(hand.slice(), [])
  return best
}

// Puntúa la mano: suma de valores (cardValue) de las cartas que NO están en melds óptimos
export function scoreHand(hand){
  const { melds, remaining } = findBestMelds(hand)
  const points = remaining.reduce((s,c)=>s+cardValue(c),0)
  return { points, melds, remaining }
}

// Caso especial: chinchón -> si remaining.length === 0, es chinchón perfecto
export function isChinchon(hand){
  const { remaining } = findBestMelds(hand)
  return remaining.length === 0
}

// Exportamos utilidades para debugging
export default {
  findBestMelds,
  scoreHand,
  isChinchon,
  cardValue
}
