# UCO Kudos — Front-end

Aplicación web de la **Plataforma Institucional de Reconocimientos de la Universidad Católica de Oriente (UCO Kudos)**, construida con Vue 3, Vite, Pinia y Vue Router. Proyecto Integrador Final del curso Diseño Orientado a Objetos.

## Requisitos

- Node.js 22.18 o superior (o 24.12 o superior).
- El back-end de UCO Kudos ejecutándose en `http://localhost:8080` (repositorio `kudos-backend`; su carpeta `documentacion` trae el manual de puesta a punto).

## Ejecución

```sh
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. Se ingresa con **Google** (el botón lleva a `http://localhost:8080/oauth2/authorization/google`). Las peticiones a `/api` se envían al back-end mediante el proxy de Vite (`/api/...` → `http://localhost:8080/api/v1/...`).

| Variable de entorno | Por defecto | Para qué |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8080` | Dirección del back-end para el proxy de Vite |
| `VITE_URL_INICIO_SESION_GOOGLE` | `http://localhost:8080/oauth2/authorization/google` | Dirección del botón "Ingresar con Google" |
| `VITE_API_BASE_URL` | `/api` | Prefijo de las llamadas a la API |

## Estructura

| Carpeta | Qué contiene |
|---|---|
| `src/api` | Cliente HTTP con la cookie de sesión y la respuesta uniforme, adaptadores DTO ↔ pantalla |
| `src/modules` | Un módulo por área: autenticación, identidad, solicitudes, autoridades, organización, categorías, kudos, moderación, auditoría y notificaciones |
| `src/components` | Barra lateral (menú según el rol), barra superior (campana de notificaciones) y componentes `Base*` reutilizables |
| `src/router` | Rutas con los roles permitidos y guardas de sesión |
| `src/stores` | Estado de la sesión (Pinia) |
| `src/__tests__` | Pruebas con Vitest contra un servidor falso que imita la API |

## Calidad

```sh
npm run lint            # ESLint + oxlint
npx vitest run          # 112 pruebas
npm run build           # compilación para producción (carpeta dist/)
```
