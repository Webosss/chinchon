# Chinchón - Frontend (Vite + React + Tailwind)

Proyecto inicial para una web de Chinchón orientada a partidas privadas (sin backend en primera fase).

## Comandos básicos

- Instalar dependencias:

```bash
npm install
```

- Desarrollo (exponer en la red para probar desde otras máquinas):

```bash
npm run dev -- --host
```

> Desarrollo con hot reload activo: editar archivos en `src/` recargará la app automáticamente (Vite + React Fast Refresh).

- Build de producción:

```bash
npm run build
```

Los archivos resultantes de producción quedan en `dist/`.

## Despliegue con Caddy (ejemplo)

1. Construir:
```bash
npm run build
```
2. Copiar `dist/` a `/var/www/chinchon/dist` (o la ruta que uses en Caddy):
```bash
sudo mkdir -p /var/www/chinchon
sudo cp -r dist/* /var/www/chinchon/dist/
sudo chown -R $USER:$USER /var/www/chinchon
```
3. Ejemplo de `Caddyfile`:
```
chin.aligpi.com {
    root * /var/www/chinchon/dist
    file_server
    encode gzip zstd
}
```

Luego recarga Caddy:
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
