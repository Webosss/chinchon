# Chinchón - Spanish Card Game

Una implementación web del juego de cartas español **Chinchón**, construida con **React 19**, **Vite**, **Tailwind CSS** y WebSocket para juego en tiempo real.

![Chinchón Game Screenshot](https://chin.aligpi.com)

## Features

✅ **Cartas españolas reales** - Imágenes PNG de baraja española auténtica (40 cartas + reverso)  
✅ **Juego en tiempo real** - WebSocket para sincronización entre jugadores  
✅ **Validación de turnos** - Control automático de acciones permitidas por turno  
✅ **Cálculo de manos** - Detección automática de melds (tríos y escaleras)  
✅ **Cierre inteligente** - Solo permitido si cartas no ligadas ≤ 5 puntos  
✅ **Interfaz responsiva** - UI moderna con Tailwind CSS  
✅ **Tests E2E** - Validación con Playwright  

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Node.js + WebSocket (ws)
- **Desarrollo**: ESM modules, Vitest, Playwright
- **Deploy**: Caddy web server

## Instalación

```bash
git clone https://github.com/tuusuario/chinchon.git
cd chinchon
npm install
```

## Desarrollo

```bash
npm run dev -- --host
```

El servidor estará disponible en `http://localhost:5173/`

## Build

```bash
npm run build
```

Archivos de producción en `dist/`

## Deploy

### Con Caddy

```bash
npm run build
sudo mkdir -p /var/www/chinchon/my-chinchon
sudo cp -r dist/* /var/www/chinchon/my-chinchon/dist/
```

Ejemplo `Caddyfile`:

```
chin.aligpi.com {
    # Frontend
    root * /var/www/chinchon/dist
    file_server
    
    # WebSocket backend
    @ws {
        path /ws*
        header Connection *Upgrade*
        header Upgrade websocket
    }
    reverse_proxy @ws localhost:4000
    
    encode gzip
    
    # SPA fallback
    try_files {path} /index.html
}
```

Recargar Caddy:
```bash
sudo systemctl reload caddy
```

## Estructura del Proyecto

```
src/
├── components/
│   ├── Card.jsx           # Carta individual con PNG
│   ├── Hand.jsx           # Mano del jugador
│   ├── DeckPile.jsx       # Mazo (deck)
│   ├── DiscardPile.jsx    # Descarte (discard)
│   ├── Modal.jsx          # Modal para resumen
│   └── Toast.jsx          # Notificaciones
├── pages/
│   ├── Home.jsx           # Página inicial
│   └── Game.jsx           # Juego principal
├── game/
│   ├── reducer.js         # Lógica de estado
│   ├── rules.js           # Cálculo de melds y puntos
│   └── rules.test.js      # Tests unitarios
├── assets/
│   └── cards/
│       ├── {01-12}-{bastos|copas|espadas|oros}.png
│       ├── reverso.png
│       └── cardImages.js   # Imports de todas las cartas
└── App.jsx
└── main.jsx

server/
├── index.js               # WebSocket server
├── game.js                # Lógica del juego
└── game.test.js           # Tests
```

## Reglas de Chinchón Implementadas

1. **Repartición**: 7 cartas por jugador
2. **Turnos**: Robar → Descartar → Terminar turno
3. **Melds**: Tríos (mismo rango) y escaleras (mismo palo, rango secuencial)
4. **Cierre**: 
   - **Chinchón**: Las 7 cartas ligadas en cualquier combinación de melds = **-10 puntos** 🎉
   - **Normal**: 6 cartas ligadas + 1 carta suelta ≤ 5 puntos
5. **Puntuación**: Suma de valores de cartas no combinadas
   - Cartas 1-7: su valor
   - Cartas 10-12: 10 puntos cada una

## API WebSocket

### Cliente → Servidor

```json
{
  "type": "action",
  "payload": {
    "roomId": "sala123",
    "action": {
      "type": "DRAW_DECK" | "DRAW_DISCARD" | "DISCARD" | "END_TURN" | "CLOSE_ROUND",
      "player": "nombreJugador",
      "cardId": "..." // solo para DISCARD
    }
  }
}
```

### Servidor → Cliente

```json
{
  "type": "state",
  "state": {
    "id": "sala123",
    "state": "waiting" | "playing" | "finished",
    "players": { "nombreJugador": { "hand": [...], "points": 0 } },
    "order": ["jugador1", "jugador2"],
    "turnIndex": 0,
    "deckCount": 25,
    "discardPile": [{ "suit": "bastos", "rank": 12 }, ...],
    "discardCount": 15,
    "turnState": { "hasDrawn": false, "hasDiscarded": false },
    "round": 1,
    "closer": null,
    "lastRoundSummary": {...}
  }
}
```

## Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

## Licencia

MIT

## Autor

Alberto - 2026

---

**Repo**: https://github.com/tuusuario/chinchon  
**Demo**: https://chin.aligpi.com

```bash
sudo systemctl reload caddy
```

## Estado
- Skeleton inicial: vistas `Home` y `Game`, reducer de juego con lógica de mazo, robo y descartes.
- Nueva: lógica de combinaciones y puntuación en `src/game/rules.js`. Detecta sets y runs, calcula puntos de cartas no combinadas (deadwood) y detecta chinchón perfecto.
- Tests: se añadieron tests unitarios con Vitest en `src/game/rules.test.js`. Ejecuta `npm test` o `npm run test:watch` para modo TDD.
- Multiusuario: ahora hay un servidor WebSocket (`server/index.js`) que mantiene el estado autoritativo por sala. Usa `ws://localhost:4000` por defecto; en producción el cliente intentará conectarse a `wss://<tu-dominio>/ws` por defecto (configurable con `VITE_WS_URL` durante el build).
- Para producción con Caddy, añade un bloque que haga reverse proxy a `localhost:4000` para las conexiones WebSocket. Un ejemplo de `Caddyfile` está en `deploy/Caddyfile`.
- Para correr el backend en producción, puedes usar systemd con la unit de ejemplo `deploy/chinchon-ws.service` (copiarla a `/etc/systemd/system/` y ajustar `User` y `WorkingDirectory`).
- Próximos pasos: pulir y testear las reglas (más tests y casos límite), y despliegue del servidor WebSocket si necesitas partidas remotas.


Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
