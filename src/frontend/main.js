import css from './style.css?raw';

const styleTag = document.createElement('style');
styleTag.textContent = css;
document.head.appendChild(styleTag);

const API_URL = 'http://127.0.0.1:3001/api/tasks';
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const columns = {
  pendiente: document.querySelector('[data-status="pendiente"] .task-list'),
  en_proceso: document.querySelector('[data-status="en_proceso"] .task-list'),
  completado: document.querySelector('[data-status="completado"] .task-list'),
  archivado: document.querySelector('[data-status="archivado"] .task-list'),
};

let tasksCache = [];
let deleteTargetId = null;
let selectedTaskId = null;
let editingTaskId = null;

function getTasksForColumn(status) {
  return tasksCache
    .filter((task) => task.status === status)
    .sort((a, b) => a.position - b.position);
}

function getColumnStatus(listElement) {
  return listElement.closest('.column')?.dataset.status;
}

function openDeleteModal(taskId) {
  deleteTargetId = taskId;
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
}

function closeDeleteModal() {
  deleteTargetId = null;
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function openEditModal(taskId) {
  const task = tasksCache.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-description').value = task.description || '';

  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  document.getElementById('edit-task-title').focus();
}

function closeEditModal() {
  editingTaskId = null;
  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

function selectTask(taskId) {
  selectedTaskId = taskId;
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

function createCard(task) {
  const card = document.createElement('article');
  card.className = 'task-card';
  card.draggable = true;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.dataset.id = task.id;
  card.dataset.status = task.status;
  card.dataset.position = task.position;

  card.innerHTML = `
    <div class="card-header">
      <h3>${task.title}</h3>
      <button class="delete-btn" type="button" aria-label="Eliminar tarea" tabindex="-1">✕</button>
    </div>
  `;

  card.addEventListener('click', () => {
    selectTask(task.id);
  });

  card.addEventListener('focus', () => {
    selectTask(task.id);
  });

  card.addEventListener('keydown', async (event) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      const cards = Array.from(document.querySelectorAll('.task-card'));
      const currentIndex = cards.findIndex((item) => item.dataset.id === task.id);
      const nextCard = cards[currentIndex + 1];
      if (nextCard) {
        event.preventDefault();
        nextCard.focus();
        selectTask(nextCard.dataset.id);
      }
      return;
    }

    if (event.key === 'Tab' && event.shiftKey) {
      const cards = Array.from(document.querySelectorAll('.task-card'));
      const currentIndex = cards.findIndex((item) => item.dataset.id === task.id);
      const prevCard = cards[currentIndex - 1];
      if (prevCard) {
        event.preventDefault();
        prevCard.focus();
        selectTask(prevCard.dataset.id);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      selectTask(task.id);
      openEditModal(task.id);
      return;
    }

    if (event.ctrlKey && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextStatus = getNextStatus(task.status, direction);
      if (nextStatus !== task.status) {
        await updateTask(task.id, { status: nextStatus, position: Date.now() });
      }
    }
  });

  card.addEventListener('dragstart', (event) => {
    card.classList.add('dragging');
    event.dataTransfer.setData('text/plain', task.id);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });

  card.addEventListener('dragover', (event) => {
    event.preventDefault();
    card.classList.add('drag-over');
  });

  card.addEventListener('dragleave', () => {
    card.classList.remove('drag-over');
  });

  card.addEventListener('drop', async (event) => {
    event.preventDefault();
    event.stopPropagation();
    card.classList.remove('drag-over');
    const taskId = event.dataTransfer.getData('text/plain');
    if (!taskId || taskId === task.id) return;

    const draggedTask = tasksCache.find((item) => item.id === taskId);
    if (!draggedTask) return;

    const targetStatus = task.status;
    const targetColumnTasks = getTasksForColumn(targetStatus);
    const targetIndex = targetColumnTasks.findIndex((item) => item.id === task.id);
    const isBefore = event.clientY < card.getBoundingClientRect().top + card.offsetHeight / 2;

    const referenceTasks = [...targetColumnTasks];
    const newIndex = isBefore ? targetIndex : targetIndex + 1;
    const prevTask = referenceTasks[newIndex - 1] || null;
    const nextTask = referenceTasks[newIndex] || null;
    const newPosition = computeNextPosition(prevTask, nextTask);

    await updateTask(draggedTask.id, {
      status: targetStatus,
      position: newPosition,
    });
  });

  return card;
}

function renderTasks(tasks) {
  tasksCache = tasks;

  Object.values(columns).forEach((list) => {
    list.innerHTML = '';
  });

  Object.keys(columns).forEach((status) => {
    getTasksForColumn(status).forEach((task) => {
      columns[status].appendChild(createCard(task));
    });
  });

  document.querySelectorAll('[data-count]').forEach((badge) => {
    const status = badge.closest('.column').dataset.status;
    const count = getTasksForColumn(status).length;
    badge.textContent = count;
  });

  if (selectedTaskId) {
    const selectedTask = tasksCache.find((task) => task.id === selectedTaskId);
    if (selectedTask) {
      selectTask(selectedTask.id);
    } else {
      selectedTaskId = null;
    }
  }
}

function computeNextPosition(prevTask, nextTask) {
  if (!prevTask && !nextTask) return Date.now();
  if (!prevTask) return nextTask.position - 1;
  if (!nextTask) return prevTask.position + 1;
  return Math.floor((prevTask.position + nextTask.position) / 2);
}

async function loadTasks() {
  try {
    const response = await fetch(API_URL);
    const tasks = await response.json();
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

  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  taskForm.reset();
  await loadTasks();
}

async function updateTask(taskId, updates) {
  await fetch(`${API_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  await loadTasks();
}

async function deleteTask(taskId) {
  await fetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
  await loadTasks();
}

function attachInteractions() {
  document.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete-btn')) return;
    const card = event.target.closest('.task-card');
    if (!card) return;
    openDeleteModal(card.dataset.id);
  });

  document.getElementById('cancel-delete').addEventListener('click', closeDeleteModal);
  document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (!deleteTargetId) return;
    await deleteTask(deleteTargetId);
    closeDeleteModal();
  });

  document.querySelector('[data-modal-close]').addEventListener('click', closeDeleteModal);

  document.getElementById('cancel-edit').addEventListener('click', closeEditModal);
  document.getElementById('save-edit').addEventListener('click', async () => {
    if (!editingTaskId) return;
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    if (!title) return;

    await updateTask(editingTaskId, { title, description });
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

      const draggedTask = tasksCache.find((task) => task.id === taskId);
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
