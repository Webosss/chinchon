# Chinchón Card Game - GitHub Issue & PR Templates

Este repositorio sigue [Conventional Commits](https://www.conventionalcommits.org/).

## Tipos de commits

- **feat**: Nueva característica
- **fix**: Corrección de bug
- **docs**: Cambios en documentación
- **style**: Cambios de estilo (no lógica)
- **refactor**: Refactorización de código
- **perf**: Mejoras de performance
- **test**: Agregación o actualización de tests
- **chore**: Tareas de configuración/build

## Ejemplo

```
feat: implement card selection in hand
fix: resolve deck pile PNG border issue
docs: update API documentation
```

## Pull Request Checklist

- [ ] Tests pasando (`npm run test`)
- [ ] Build exitoso (`npm run build`)
- [ ] Cambios documentados en README si aplica
- [ ] Sin console.log o código comentado
- [ ] ESLint sin warnings

## Reportar Issues

Por favor incluye:
- Descripción del problema
- Pasos para reproducir
- Comportamiento esperado vs. actual
- Screenshots si es UI
- Versión de Node.js / Browser
