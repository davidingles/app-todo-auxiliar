import { getToken, redirectToLogin, getCachedUser, saveUser, clearSession } from './auth/session.js';
import { fetchTasks, createTask as apiCreateTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask, fetchMe } from './api/client.js';
import { state } from './state.js';
import { normalizeTags, sortTasks } from './utils/format.js';
import { createCard } from './components/card.js';
import {
  openDeleteModal,
  closeDeleteModal,
  openEditModal,
  closeEditModal,
  handleModalKeydown,
  getSelectedTags,
} from './components/modals.js';

if (!getToken()) {
  redirectToLogin();
}

function displayUser(user) {
  const avatarImg = document.getElementById('user-avatar');
  const nameSpan = document.getElementById('user-name');
  if (!avatarImg || !nameSpan) return;

  if (user.avatar) {
    avatarImg.src = user.avatar;
    avatarImg.style.display = '';
  } else {
    avatarImg.style.display = 'none';
  }
  nameSpan.textContent = user.name || user.email || '';
}

async function loadUserInfo() {
  const cached = getCachedUser();
  if (cached) {
    displayUser(cached);
  }

  try {
    const user = await fetchMe();
    if (!user) return;
    saveUser(user);
    displayUser(user);
  } catch {
    // Ignorar errores de carga
  }
}

loadUserInfo();

const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const searchInput = document.getElementById('search-input');
const logoutBtn = document.getElementById('logout-btn');
const columns = {
  pendiente: document.querySelector('[data-status="pendiente"] .task-list'),
  en_proceso: document.querySelector('[data-status="en_proceso"] .task-list'),
  completado: document.querySelector('[data-status="completado"] .task-list'),
  archivado: document.querySelector('[data-status="archivado"] .task-list'),
};

function getTasksForColumn(status, tasks = state.tasksCache) {
  return sortTasksForColumn(tasks.filter((task) => task.status === status), status);
}

function selectTask(taskId) {
  state.selectedTaskId = taskId;
  document.querySelectorAll('.task-card').forEach((card) => {
    const isSelected = card.dataset.id === taskId;
    card.classList.toggle('is-selected', isSelected);
    card.setAttribute('aria-selected', String(isSelected));
  });
}

function getStatusOrder() {
  return ['pendiente', 'en_proceso', 'completado', 'archivado'];
}

function getNextStatus(status, direction) {
  const statuses = getStatusOrder();
  const index = statuses.indexOf(status);
  if (index === -1) return status;
  const nextIndex = index + direction;
  return statuses[Math.max(0, Math.min(statuses.length - 1, nextIndex))] || status;
}

function sortTasksForColumn(tasks, status) {
  const sortMode = state.columnSortModes[status] || 'manual';
  const searchTerm = searchInput.value.trim().toLowerCase();
  return sortTasks(tasks, { mode: sortMode, searchTerm });
}

function computeNextPosition(prevTask, nextTask) {
  if (!prevTask && !nextTask) return Date.now();
  if (!prevTask) return nextTask.position - 1;
  if (!nextTask) return prevTask.position + 1;
  return Math.floor((prevTask.position + nextTask.position) / 2);
}

function renderTasks(tasks) {
  state.tasksCache = tasks;
  applySearchFilter();
}

function applySearchFilter() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  Object.values(columns).forEach((list) => {
    list.innerHTML = '';
  });

  state.filteredTasksCache = searchTerm
    ? state.tasksCache.filter((task) =>
        task.title.toLowerCase().includes(searchTerm) ||
        (task.description && task.description.toLowerCase().includes(searchTerm)) ||
        normalizeTags(task.tags).some((tag) => tag.toLowerCase().includes(searchTerm))
      )
    : [...state.tasksCache];

  Object.keys(columns).forEach((status) => {
    sortTasksForColumn(state.filteredTasksCache.filter((task) => task.status === status), status)
      .forEach((task) => columns[status].appendChild(createCard(task, ctx)));
  });

  document.querySelectorAll('[data-count]').forEach((badge) => {
    const status = badge.closest('.column').dataset.status;
    const count = state.filteredTasksCache.filter((t) => t.status === status).length;
    badge.textContent = count;
  });

  if (state.selectedTaskId) {
    const selectedTask = state.tasksCache.find((task) => task.id === state.selectedTaskId);
    if (selectedTask && state.filteredTasksCache.some((t) => t.id === state.selectedTaskId)) {
      selectTask(selectedTask.id);
      const card = document.querySelector(`[data-id="${state.selectedTaskId}"]`);
      if (card) card.focus();
    } else {
      state.selectedTaskId = null;
    }
  }
}

async function loadTasks() {
  try {
    const tasks = await fetchTasks();
    renderTasks(tasks);
  } catch (error) {
    console.error('No se pudieron cargar las tareas', error);
  }
}

async function createTask(event) {
  event.preventDefault();
  const payload = {
    title: titleInput.value.trim(),
    description: descriptionInput.value.trim(),
    status: 'pendiente',
  };

  if (!payload.title) return;

  await apiCreateTask(payload);

  taskForm.reset();
  await loadTasks();
}

async function updateTask(taskId, updates) {
  await apiUpdateTask(taskId, updates);
  await loadTasks();
}

async function deleteTask(taskId) {
  await apiDeleteTask(taskId);
  await loadTasks();
}

const ctx = {
  selectTask,
  openEditModal,
  openDeleteModal,
  getNextStatus,
  getStatusOrder,
  getTasksForColumn,
  updateTask,
  loadTasks,
  computeNextPosition,
  getTasksCache: () => state.tasksCache,
};

function attachInteractions() {
  document.addEventListener('keydown', handleModalKeydown);

  searchInput.addEventListener('input', () => {
    applySearchFilter();
  });

  document.querySelectorAll('[data-sort-control]').forEach((control) => {
    const status = control.closest('.column')?.dataset.status;
    if (!status) return;

    control.value = state.columnSortModes[status];
    control.addEventListener('change', () => {
      state.columnSortModes[status] = control.value;
      applySearchFilter();
    });
  });

  const sidebar = document.querySelector('[data-sidebar="archivado"]');
  const sidebarToggle = sidebar?.querySelector('.sidebar-toggle');
  if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-expanded');
      const isExpanded = sidebar.classList.contains('is-expanded');
      sidebarToggle.setAttribute('aria-label', isExpanded ? 'Contraer archivado' : 'Expandir archivado');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearSession();
      window.location.href = '/login.html';
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const tag = document.activeElement?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select';
      if (!isInput) {
        event.preventDefault();
        searchInput.focus();
      }
    }
    if (event.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.blur();
    }
    if (event.ctrlKey && event.shiftKey && (event.key === 'a' || event.key === 'A')) {
      event.preventDefault();
      const btn = document.querySelector('.sidebar-toggle');
      if (btn) btn.click();
    }
  });

  document.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete-btn')) return;
    event.stopPropagation();
    const card = event.target.closest('.task-card');
    if (!card) return;
    selectTask(card.dataset.id);
    openDeleteModal(card.dataset.id);
  });

  document.addEventListener('click', (event) => {
    const tagButton = event.target.closest('.tag-btn');
    if (!tagButton) return;
    event.stopPropagation();
    const card = tagButton.closest('.task-card');
    if (!card) return;
    selectTask(card.dataset.id);
    openEditModal(card.dataset.id, 'tags');
  });

  document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (!state.deleteTargetId) return;
    await deleteTask(state.deleteTargetId);
    closeDeleteModal();
  });

  document.querySelector('[data-modal-close]').addEventListener('click', closeDeleteModal);

  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
  document.getElementById('save-edit').addEventListener('click', async () => {
    if (!state.editingTaskId) return;
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    const tags = getSelectedTags();
    if (!title) return;

    await updateTask(state.editingTaskId, { title, description, tags });
    closeEditModal();
  });

  document.querySelector('[data-edit-close]').addEventListener('click', closeEditModal);

  Object.entries(columns).forEach(([status, list]) => {
    list.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    list.addEventListener('dragenter', () => {
      list.classList.add('drag-over');
    });

    list.addEventListener('dragleave', () => {
      list.classList.remove('drag-over');
    });

    list.addEventListener('drop', async (event) => {
      event.preventDefault();
      list.classList.remove('drag-over');
      const taskId = event.dataTransfer.getData('text/plain');
      if (!taskId) return;

      const draggedTask = state.tasksCache.find((task) => task.id === taskId);
      if (!draggedTask) return;

      const targetStatus = status;
      const targetColumnTasks = getTasksForColumn(targetStatus);
      const newPosition = targetColumnTasks.length
        ? targetColumnTasks[targetColumnTasks.length - 1].position + 1
        : Date.now();

      await updateTask(draggedTask.id, {
        status: targetStatus,
        position: newPosition,
      });
    });
  });
}

taskForm.addEventListener('submit', createTask);

window.addEventListener('DOMContentLoaded', () => {
  attachInteractions();
  loadTasks();
});