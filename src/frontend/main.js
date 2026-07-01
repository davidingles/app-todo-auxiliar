import './style.css';

const API_URL = 'http://127.0.0.1:3001/api/tasks';
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const columns = {
  pendiente: document.querySelector('[data-status="pendiente"] .task-list'),
  en_proceso: document.querySelector('[data-status="en_proceso"] .task-list'),
  completado: document.querySelector('[data-status="completado"] .task-list'),
};

function getStatusLabel(status) {
  return {
    pendiente: 'Pendiente',
    en_proceso: 'En Proceso',
    completado: 'Completado',
  }[status] ?? 'Pendiente';
}

function createCard(task) {
  const card = document.createElement('article');
  card.className = 'task-card';
  card.draggable = true;
  card.dataset.id = task.id;
  card.dataset.status = task.status;

  card.innerHTML = `
    <h3>${task.title}</h3>
    <p>${task.description || 'Sin descripción'}</p>
    <div class="card-actions">
      <select class="task-status-select">
        <option value="pendiente" ${task.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
        <option value="en_proceso" ${task.status === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
        <option value="completado" ${task.status === 'completado' ? 'selected' : ''}>Completado</option>
      </select>
      <button class="delete-btn" type="button" aria-label="Eliminar tarea">✕</button>
    </div>
  `;

  card.addEventListener('dragstart', (event) => {
    card.classList.add('dragging');
    event.dataTransfer.setData('text/plain', task.id);
  });

  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
  });

  return card;
}

function renderTasks(tasks) {
  Object.values(columns).forEach((list) => {
    list.innerHTML = '';
  });

  tasks.forEach((task) => {
    const column = columns[task.status] || columns.pendiente;
    column.appendChild(createCard(task));
  });

  document.querySelectorAll('[data-count]').forEach((badge) => {
    const status = badge.closest('.column').dataset.status;
    const count = tasks.filter((task) => task.status === status).length;
    badge.textContent = count;
  });
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
  document.addEventListener('change', async (event) => {
    if (!event.target.classList.contains('task-status-select')) return;
    const card = event.target.closest('.task-card');
    if (!card) return;
    await updateTask(card.dataset.id, { status: event.target.value });
  });

  document.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete-btn')) return;
    const card = event.target.closest('.task-card');
    if (!card) return;
    await deleteTask(card.dataset.id);
  });

  Object.entries(columns).forEach(([status, list]) => {
    list.addEventListener('dragover', (event) => {
      event.preventDefault();
    });

    list.addEventListener('drop', async (event) => {
      event.preventDefault();
      const taskId = event.dataTransfer.getData('text/plain');
      if (!taskId) return;
      await updateTask(taskId, { status });
    });
  });
}

taskForm.addEventListener('submit', createTask);

window.addEventListener('DOMContentLoaded', () => {
  attachInteractions();
  loadTasks();
});
