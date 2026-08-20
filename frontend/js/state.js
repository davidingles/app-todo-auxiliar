export const state = {
  tasksCache: [],
  filteredTasksCache: [],
  deleteTargetId: null,
  selectedTaskId: null,
  editingTaskId: null,
  lastFocusedElement: null,
  columnSortModes: {
    pendiente: 'manual',
    en_proceso: 'manual',
    completado: 'manual',
    archivado: 'manual',
  },
  tagOptions: ['trabajo', 'gym', 'familia', 'devs', 'religion', 'personal'],
};