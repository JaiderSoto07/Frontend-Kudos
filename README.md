# UCO Kudos — Front-end

Aplicación web de UCO Kudos construida con Vue 3, Vite, Pinia y Vue Router.

## Requisitos

- Node.js 22.18 o superior (o 24.12 o superior).
- El back-end de UCO Kudos ejecutándose en `http://localhost:8080`.

## Ejecución

```sh
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. Las peticiones a `/api` se envían al back-end mediante el proxy de Vite (`/api/...` → `http://localhost:8080/api/v1/...`). Si el back-end corre en otra dirección, se indica con la variable de entorno `BACKEND_URL`.

## Calidad

```sh
npm run lint
npm run test:unit
npm run build
```
