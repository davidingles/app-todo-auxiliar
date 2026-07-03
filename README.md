# Todo Tasks

Aplicación de lista de tareas estilo Kanban con frontend vanilla JavaScript y backend Node.js/Express/better-sqlite3.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Ejecución

### Desarrollo (frontend + backend)

```bash
npm run dev
```

Esto inicia:
- Frontend: http://127.0.0.1:5173
- Backend: http://127.0.0.1:3001

### Construir para producción

```bash
npm run build
```

### Previsualizar build

```bash
npm run preview
```

## Funcionamiento

### Gestión de tareas
- **Crear**: Completa el formulario en la barra superior y pulsa "Añadir"
- **Editar**: Selecciona una tarea y pulsa Enter, o haz clic en el botón eliminar y confirma
- **Eliminar**: Selecciona una tarea y pulsa Delete, o usa el botón × en cada tarea

### Navegación por teclado
- **Tab/Shift+Tab**: Navegar entre tareas
- **Enter**: Abrir modal de edición
- **Delete**: Eliminar tarea
- **Ctrl+F**: Enfocar el buscador

### Navegación por teclado
- **Tab/Shift+Tab**: Navegar entre tareas
- **Enter**: Abrir modal de edición
- **Delete**: Eliminar tarea
- **Ctrl+F**: Enfocar el buscador

### Búsqueda
- Escribe en el campo de búsqueda para filtrar tareas por título o descripción
- Las tareas que no coinciden quedan ocultas

### Movimiento entre columnas
- **Ctrl+Arrow Left/Right**: Cambiar estado de la tarea
- **Ctrl+Arrow Up/Down**: Reordenar posición dentro de la columna

### Drag & Drop
- Arrastrar tareas entre columnas
- Reordenar dentro de la misma columna

### Columnas
- Pendiente → En Proceso → Completado → Archivado