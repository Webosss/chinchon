# Development Guide

## Setup

```bash
npm install
```

## Commands

### Development
```bash
npm run dev -- --host
```
Accesible en `http://localhost:5173/`

### Build
```bash
npm run build
```

### Tests
```bash
npm run test              # Unit tests (Vitest)
npm run test:e2e         # E2E tests (Playwright)
npm run lint             # ESLint
```

## Project Structure

### Frontend (Vite + React)

- **src/components/** - Componentes React reutilizables
- **src/pages/** - Páginas principales (Home, Game)
- **src/game/** - Lógica de juego
  - `rules.js` - Cálculo de melds y puntuación
  - `reducer.js` - Gestión de estado
- **src/assets/cards/** - Imágenes PNG de cartas españolas

### Backend (Node.js + WebSocket)

- **server/index.js** - Servidor WebSocket
- **server/game.js** - Lógica del juego
- **deploy/** - Archivos de configuración (Caddy, systemd)

## Game Logic

### findBestMelds(hand)
Calcula la mejor combinación de melds (tríos y escaleras) para una mano dada.

Devuelve:
```javascript
{
  melds: [[], []],      // Array de melds
  remaining: []         // Cartas no combinadas
}
```

### scoreHand(hand)
Calcula los puntos no ligados usando `findBestMelds`.

Devuelve:
```javascript
{
  points: 15,           // Suma de valores de cartas restantes
  melds: [[], []],
  remaining: []
}
```

### Válidas Actions por Turno

1. **Estado inicial**: `hasDrawn: false, hasDiscarded: false`
   - ✅ `DRAW_DECK` o `DRAW_DISCARD`
   
2. **Después de robar**: `hasDrawn: true, hasDiscarded: false`
   - ✅ `DISCARD`
   - ✅ `CLOSE_ROUND` (si `scoreHand <= 5`)

3. **Después de descartar**: `hasDrawn: true, hasDiscarded: true`
   - ✅ `END_TURN`

## Card Images

Las imágenes están en `src/assets/cards/`:
- **Format**: `{rango}-{palo}.png` (ej: `12-bastos.png`)
- **Rango**: 01-12 (sin 8, 9 - baraja española)
- **Palo**: bastos, copas, espadas, oros
- **Reverso**: `reverso.png`

El mapeo se gestiona en `src/assets/cards/cardImages.js`:
```javascript
import bastos_12 from './12-bastos.png'
export const cardImages = {
  bastos: { 12: bastos_12, ... },
  ...
}
```

## WebSocket Events

### Client sends:
```javascript
{
  type: 'action',
  payload: {
    roomId: 'sala123',
    action: {
      type: 'DRAW_DECK' | 'DISCARD' | etc,
      player: 'nombreJugador',
      cardId: '...' // solo DISCARD
    }
  }
}
```

### Server broadcasts:
```javascript
{
  type: 'state',
  state: { /* full game state */ }
}
```

## Testing

### Unit Tests (Vitest)
```bash
npm run test
```
Busca archivos `*.test.js`

### E2E Tests (Playwright)
```bash
npm run test:e2e
```
Archivos en `tests/e2e/*.spec.js`

## Deployment

### Local Development
```bash
npm run dev -- --host
```

### Production Build
```bash
npm run build
rsync -av --delete dist/ /var/www/chinchon/my-chinchon/dist/
sudo systemctl reload caddy
```

### WebSocket Server
```bash
# Terminal 1: Dev
cd server && node index.js

# Production (systemd)
sudo systemctl start chinchon-ws
sudo systemctl status chinchon-ws
```

## Common Issues

### Port 4000 already in use
```bash
lsof -i :4000
kill -9 <PID>
```

### Cards not loading
Verifica que `src/assets/cards/cardImages.js` tenga todos los imports correctos

### WebSocket not connecting
Comprueba que `server/index.js` está corriendo y que el puerto es el correcto

## Code Style

- **ESLint**: Ejecuta `npm run lint`
- **Format**: Usa Prettier (opcional)
- **Commit messages**: Sigue [Conventional Commits](https://www.conventionalcommits.org/)

## Contributing

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/my-feature`)
3. Commit con mensajes descriptivos
4. Push a la rama
5. Abre un Pull Request

---

¿Preguntas? Abre un issue en GitHub.
