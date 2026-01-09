# Quick Start Guide

## 30 segundos para jugar

### 1. Instalar
```bash
git clone https://github.com/tuusuario/chinchon.git
cd chinchon
npm install
```

### 2. Arrancar servidor WebSocket (Terminal 1)
```bash
cd server
node index.js
```
Debería mostrar: `WebSocket server listening on ws://localhost:4000`

### 3. Arrancar dev server (Terminal 2)
```bash
npm run dev -- --host
```
Abre `http://localhost:5173` en el navegador

### 4. Jugar
- Crea una sala (ej: "sala1")
- Comparte el link
- Otro jugador se une
- ¡A jugar!

## ¿Qué ves?

```
┌─────────────────────────────────────┐
│ Sala: sala1 | Turno: Juan | Ronda: 1│
└─────────────────────────────────────┘
          
        [Mazo]      [Descarte]
        (40)          12♥
          
├─ Oros    ├─ Copas   ├─ Espadas  ├─ Bastos
│12 7 5    │12 11 10  │12 11 7    │12 11 10
│4 3 1     │6 5 4 3   │6 5 4 3    │7 6 5 4
```

## Controles

- **Clic en mazo/descarte**: Robar carta
- **Clic en carta**: Descartar
- **Botones**: Terminar turno, Cerrar, Repartir

## Reglas

1. **Robar**: Toma una carta del mazo o descarte
2. **Descartar**: Tira una de tu mano (debes tener 8 después)
3. **Cerrar**: Solo si cartas no ligadas ≤ 5 puntos
4. **Terminar**: Fin de tu turno

## Errores comunes

| Error | Solución |
|-------|----------|
| "No es tu turno" | Espera a que sea tu turno |
| "Ya has robado una carta" | Descarta antes de robar otra |
| "Cartas no ligadas > 5" | Mejora tu mano antes de cerrar |
| WebSocket not connecting | Verifica `node server/index.js` |

## Desarrollo

Ver [DEVELOPMENT.md](DEVELOPMENT.md) para setup avanzado

## Testing

```bash
npm run test              # Unit tests
npm run test:e2e         # E2E tests
```

---

¿Problemas? Abre un [issue en GitHub](https://github.com/tuusuario/chinchon/issues)
