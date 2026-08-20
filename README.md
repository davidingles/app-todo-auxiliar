# Todo Tasks

Aplicación de lista de tareas estilo Kanban con frontend vanilla JavaScript (módulos ES nativos, sin bundler) y backend Node.js/Express/better-sqlite3.

## Arquitectura

El proyecto está separado en tres carpetas raíz:

```
APP-TAREAS-CARDS/
├── backend/          → API Express (rutas, controladores, middleware, servicios)
├── database/         → Capa de datos (conexión, modelos, migraciones, datos SQLite)
├── frontend/         → Interfaz (HTML, CSS, módulos JS, assets)
└── public/           → Assets estáticos servidos tal cual (favicon.ico)
```

- **backend/**: `server.js` (entrada), `config/`, `routes/`, `controllers/`, `middleware/`, `services/`, `utils/`. Tiene su propio `package.json` y `node_modules`.
- **database/**: `connection.js`, `models/` (user, task), `migrations/init.js` y `data/` (archivos `.db` y `uploads/`, incluidos en el repo). Tiene su propio `package.json` y `node_modules` (better-sqlite3).
- **frontend/**: `index.html`, `login.html`, `css/`, `js/` (módulos ES) y `assets/`. Sin dependencias, no necesita `package.json`.

No se usa Vite: el servidor Express sirve el frontend directamente y los módulos JS se cargan con `<script type="module">`.

## Requisitos

- Node.js 18+ (recomendado LTS)
- npm

## Instalación

`backend/` y `database/` son paquetes independientes. Instala cada uno:

```bash
cd backend && npm install
cd database && npm install
```

## Ejecución

Un único servidor sirve la API y el frontend:

```bash
cd backend && npm start
```

- App: http://127.0.0.1:3001
- API: http://127.0.0.1:3001/api

## Despliegue en VPS (vía GitHub)

Clona el repositorio en el servidor y ejecuta:

```bash
git clone <url-del-repo> && cd APP-TAREAS-CARDS
cd backend && npm install
cd database && npm install
```

Crea el archivo `.env` en la raíz (el `.env` **no** se sube a GitHub; usa `.env.example` como plantilla):

```bash
cp .env.example .env   # y edita JWT_SECRET (y Google OAuth si lo usas)
```

Arranca con PM2:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

- App: http://tu-vps:3001
- API: http://tu-vps:3001/api

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` / `npm start` (en `backend/`) | Arranca el servidor (API + frontend) |
| `npm run check-dbs` (en la raíz) | Inspecciona las bases de datos SQLite |
| `npm run generate-ico` (en la raíz) | Genera `favicon.ico` desde el SVG |

## Funcionamiento

### Gestión de tareas
- **Crear**: Completa el formulario en la barra superior y pulsa "Añadir"
- **Editar**: Doble clic o Enter sobre una tarea
- **Eliminar**: Selecciona una tarea y pulsa Delete, o usa el botón × en cada tarea

### Navegación por teclado
- **Tab/Shift+Tab**: Navegar entre tareas
- **Enter**: Abrir modal de edición
- **Delete**: Eliminar tarea
- **Ctrl+F**: Enfocar el buscador
- **Ctrl+Arrow Left/Right**: Cambiar estado de la tarea
- **Ctrl+Arrow Up/Down**: Reordenar posición dentro de la columna

### Búsqueda
- Escribe en el campo de búsqueda para filtrar tareas por título, descripción o etiquetas

### Drag & Drop
- Arrastrar tareas entre columnas y reordenar dentro de la misma columna

### Columnas
- Pendiente → En Proceso → Completado → Archivado