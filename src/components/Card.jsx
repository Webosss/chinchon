// Card.jsx - Render Spanish playing cards using REAL SVG images from assets
import { useMemo } from 'react';
import { cardImages } from '../assets/cards/cardImages.js';

export default function Card({ suit, rank, faceUp = true, onClick, disabled = false, selected = false, size = 'w-24 h-36' }) {
  // Get the image source for the card
  const imageSrc = useMemo(() => {
    if (!faceUp) {
      return cardImages.back;
    }
    
    // Normalize suit name to lowercase
    const suitName = suit?.toLowerCase() || 'oros';
    
    // Get the card image from the imported mapping
    return cardImages[suitName]?.[rank] || cardImages.oros[1];
  }, [faceUp, suit, rank]);

  return (
    <div
      onClick={onClick}
      aria-label={faceUp ? `Carta ${rank} de ${suit}` : 'Carta boca abajo'}
      className={`
        relative ${size} flex items-center justify-center overflow-hidden rounded-lg
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'card-hover cursor-pointer'}
        ${selected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-green-900 card-glow' : ''}
        transition-all duration-300
      `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          onClick?.();
        }
      }}
    >
      <img
        src={imageSrc}
        alt={faceUp ? `${rank} de ${suit}` : 'Carta boca abajo'}
        className="w-full h-full object-cover pointer-events-none rounded-lg shadow-2xl"
        draggable="false"
      />
      {selected && (
        <div className="absolute inset-0 bg-amber-400/20 rounded-lg pointer-events-none animate-pulse-soft" />
      )}
    </div>
  );
}


