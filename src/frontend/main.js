import css from './style.css?raw';

const styleTag = document.createElement('style');
styleTag.textContent = css;
document.head.appendChild(styleTag);

const API_URL = 'http://127.0.0.1:3001/api/tasks';
const taskForm = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const searchInput = document.getElementById('search-input');
const columns = {
  pendiente: document.querySelector('[data-status="pendiente"] .task-list'),
  en_proceso: document.querySelector('[data-status="en_proceso"] .task-list'),
  completado: document.querySelector('[data-status="completado"] .task-list'),
  archivado: document.querySelector('[data-status="archivado"] .task-list'),
};
const columnSortModes = {
  pendiente: 'manual',
  en_proceso: 'manual',
  completado: 'manual',
  archivado: 'manual',
};

let tasksCache = [];
let filteredTasksCache = [];
let deleteTargetId = null;
let selectedTaskId = null;
let editingTaskId = null;
let lastFocusedElement = null;

function getTasksForColumn(status, tasks = tasksCache) {
  return sortTasksForColumn(tasks.filter((task) => task.status === status), status);
}

function getColumnStatus(listElement) {
  return listElement.closest('.column')?.dataset.status;
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
  ).filter((element) => {
    const isHidden = element.getAttribute('aria-hidden') === 'true' || element.hidden;
    const isDisabled = element.disabled;
    return !isHidden && !isDisabled && element.tabIndex !== -1;
  });
}

function handleModalKeydown(event) {
  if (event.key !== 'Tab') return;

  const modal = document.querySelector('.modal:not(.hidden)');
  if (!modal) return;

  const focusableElements = getFocusableElements(modal);
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const isShiftTab = event.shiftKey;

  if (isShiftTab && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!isShiftTab && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function openDeleteModal(taskId) {
  deleteTargetId = taskId;
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    const cancelButton = document.getElementById('cancel-delete');
    if (cancelButton) cancelButton.focus();
  });
}

function closeDeleteModal() {
  deleteTargetId = null;
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function openEditModal(taskId, focusTarget = 'title') {
  const task = tasksCache.find((item) => item.id === taskId);
  if (!task) return;

  editingTaskId = taskId;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-description').value = task.description || '';
  document.getElementById('edit-task-tags').value = tagsToInputValue(task.tags);

  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  const focusElement = focusTarget === 'tags'
    ? document.getElementById('edit-task-tags')
    : document.getElementById('edit-task-title');
  focusElement.focus();
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

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) return normalizeTags(parsed);
    } catch {
      return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    }
  }

  return [];
}

function parseTagsInput(value) {
  const seen = new Set();
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function tagsToInputValue(tags) {
  return normalizeTags(tags).join(', ');
}

function compareManualOrder(a, b) {
  return a.position - b.position;
}

function compareDateOrder(a, b) {
  const dateA = Date.parse(a.updated_at || '') || 0;
  const dateB = Date.parse(b.updated_at || '') || 0;
  return dateB - dateA || compareManualOrder(a, b);
}

function getTagMatchScore(task, searchTerm) {
  if (!searchTerm) return 0;

  return normalizeTags(task.tags).reduce((bestScore, tag) => {
    const normalizedTag = tag.toLowerCase();
    if (normalizedTag === searchTerm) return Math.max(bestScore, 3);
    if (normalizedTag.startsWith(searchTerm)) return Math.max(bestScore, 2);
    if (normalizedTag.includes(searchTerm)) return Math.max(bestScore, 1);
    return bestScore;
  }, 0);
}

function compareTagOrder(a, b, searchTerm) {
  if (searchTerm) {
    const scoreDifference = getTagMatchScore(b, searchTerm) - getTagMatchScore(a, searchTerm);
    if (scoreDifference !== 0) return scoreDifference;
  }

  const tagsA = normalizeTags(a.tags).map((tag) => tag.toLowerCase()).sort();
  const tagsB = normalizeTags(b.tags).map((tag) => tag.toLowerCase()).sort();
  const hasTagsDifference = Number(tagsB.length > 0) - Number(tagsA.length > 0);
  if (hasTagsDifference !== 0) return hasTagsDifference;

  const tagNameDifference = (tagsA[0] || '').localeCompare(tagsB[0] || '', 'es');
  return tagNameDifference || compareManualOrder(a, b);
}

function sortTasksForColumn(tasks, status) {
  const sortMode = columnSortModes[status] || 'manual';
  const searchTerm = searchInput.value.trim().toLowerCase();
  const sortedTasks = [...tasks];

  if (sortMode === 'date') {
    return sortedTasks.sort(compareDateOrder);
  }

  if (sortMode === 'tags') {
    return sortedTasks.sort((a, b) => compareTagOrder(a, b, searchTerm));
  }

  return sortedTasks.sort(compareManualOrder);
}

function tagIconSvg() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.6 13.1 12 21.7a2.1 2.1 0 0 1-3 0l-6.7-6.7a2.1 2.1 0 0 1 0-3L10.9 3.4A2.1 2.1 0 0 1 12.4 3H19a2 2 0 0 1 2 2v6.6a2.1 2.1 0 0 1-.4 1.5Z" />
      <path d="M16 8h.01" />
      <path d="M9 13h6" />
      <path d="M12 10v6" />
    </svg>
  `;
}

function createCard(task) {
  const tags = normalizeTags(task.tags);
  const tagsHtml = tags.length
    ? `<div class="task-tags">${tags.map((tag) => `<span class="task-tag">#${escapeHtml(tag)}</span>`).join('')}</div>`
    : '';
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
      <h3>${escapeHtml(task.title)}</h3>
      <div class="card-actions">
        <button class="tag-btn card-action-btn" type="button" aria-label="Editar etiquetas" title="Editar etiquetas" tabindex="-1">${tagIconSvg()}</button>
        <button class="delete-btn card-action-btn" type="button" aria-label="Eliminar tarea" tabindex="-1">✕</button>
      </div>
    </div>
    ${tagsHtml}
  `;

  card.addEventListener('click', (event) => {
    if (event.target.closest('.card-action-btn')) return;
    selectTask(task.id);
  });

  card.addEventListener('dblclick', (event) => {
    if (event.target.closest('.card-action-btn')) return;
    selectTask(task.id);
    openEditModal(task.id);
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

    if (event.key === 'Delete') {
      event.preventDefault();
      selectTask(task.id);
      openDeleteModal(task.id);
      return;
    }

    // Handle Ctrl+Arrow first (before plain Arrow handlers)
    if (event.ctrlKey && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextStatus = getNextStatus(task.status, direction);
      if (nextStatus !== task.status) {
        await updateTask(task.id, { status: nextStatus, position: Date.now() });
        await loadTasks();
        // Focus and select the task in its new column
        selectTask(task.id);
        const updatedCard = document.querySelector(`[data-id="${task.id}"]`);
        if (updatedCard) updatedCard.focus();
      }
      return;
    }

    if (event.ctrlKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const columnTasks = getTasksForColumn(task.status);
      const currentIndex = columnTasks.findIndex((item) => item.id === task.id);
      
      if (event.key === 'ArrowUp' && currentIndex > 0) {
        // Swap with previous task
        const prevTask = columnTasks[currentIndex - 1];
        const tempPosition = task.position;
        await updateTask(task.id, { position: prevTask.position });
        await updateTask(prevTask.id, { position: tempPosition });
        // Refetch and maintain focus on current task
        await loadTasks();
        const updatedCard = document.querySelector(`[data-id="${task.id}"]`);
        if (updatedCard) updatedCard.focus();
      } else if (event.key === 'ArrowDown' && currentIndex < columnTasks.length - 1) {
        // Swap with next task
        const nextTask = columnTasks[currentIndex + 1];
        const tempPosition = task.position;
        await updateTask(task.id, { position: nextTask.position });
        await updateTask(nextTask.id, { position: tempPosition });
        // Refetch and maintain focus on current task
        await loadTasks();
        const updatedCard = document.querySelector(`[data-id="${task.id}"]`);
        if (updatedCard) updatedCard.focus();
      }
      return;
    }

    // Plain Arrow key handlers (without Ctrl)
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const columnTasks = getTasksForColumn(task.status);
      const currentIndex = columnTasks.findIndex((item) => item.id === task.id);
      if (currentIndex > 0) {
        const prevTask = columnTasks[currentIndex - 1];
        const prevCard = document.querySelector(`[data-id="${prevTask.id}"]`);
        if (prevCard) {
          prevCard.focus();
          selectTask(prevTask.id);
        }
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const columnTasks = getTasksForColumn(task.status);
      const currentIndex = columnTasks.findIndex((item) => item.id === task.id);
      if (currentIndex < columnTasks.length - 1) {
        const nextTask = columnTasks[currentIndex + 1];
        const nextCard = document.querySelector(`[data-id="${nextTask.id}"]`);
        if (nextCard) {
          nextCard.focus();
          selectTask(nextTask.id);
        }
      }
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const statuses = getStatusOrder();
      const currentStatusIndex = statuses.indexOf(task.status);
      if (currentStatusIndex > 0) {
        const prevStatus = statuses[currentStatusIndex - 1];
        const prevColumnTasks = getTasksForColumn(prevStatus);
        if (prevColumnTasks.length > 0) {
          const nextTask = prevColumnTasks[0];
          const nextCard = document.querySelector(`[data-id="${nextTask.id}"]`);
          if (nextCard) {
            nextCard.focus();
            selectTask(nextTask.id);
          }
        }
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const statuses = getStatusOrder();
      const currentStatusIndex = statuses.indexOf(task.status);
      if (currentStatusIndex < statuses.length - 1) {
        const nextStatus = statuses[currentStatusIndex + 1];
        const nextColumnTasks = getTasksForColumn(nextStatus);
        if (nextColumnTasks.length > 0) {
          const nextTask = nextColumnTasks[0];
          const nextCard = document.querySelector(`[data-id="${nextTask.id}"]`);
          if (nextCard) {
            nextCard.focus();
            selectTask(nextTask.id);
          }
        }
      }
      return;
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
  applySearchFilter();
}

function applySearchFilter() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  Object.values(columns).forEach((list) => {
    list.innerHTML = '';
  });

  filteredTasksCache = searchTerm
    ? tasksCache.filter(task => 
        task.title.toLowerCase().includes(searchTerm) || 
        (task.description && task.description.toLowerCase().includes(searchTerm)) ||
        normalizeTags(task.tags).some((tag) => tag.toLowerCase().includes(searchTerm))
      )
    : [...tasksCache];

  Object.keys(columns).forEach((status) => {
    sortTasksForColumn(filteredTasksCache.filter(task => task.status === status), status)
      .forEach(task => columns[status].appendChild(createCard(task)));
  });

  document.querySelectorAll('[data-count]').forEach((badge) => {
    const status = badge.closest('.column').dataset.status;
    const count = filteredTasksCache.filter(t => t.status === status).length;
    badge.textContent = count;
  });

  if (selectedTaskId) {
    const selectedTask = tasksCache.find(task => task.id === selectedTaskId);
    if (selectedTask && filteredTasksCache.some(t => t.id === selectedTaskId)) {
      selectTask(selectedTask.id);
      const card = document.querySelector(`[data-id="${selectedTaskId}"]`);
      if (card) card.focus();
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
   document.addEventListener('keydown', handleModalKeydown);

   searchInput.addEventListener('input', () => {
     applySearchFilter();
   });

   document.querySelectorAll('[data-sort-control]').forEach((control) => {
     const status = control.closest('.column')?.dataset.status;
     if (!status) return;

     control.value = columnSortModes[status];
     control.addEventListener('change', () => {
       columnSortModes[status] = control.value;
       applySearchFilter();
     });
   });

   document.addEventListener('keydown', (event) => {
     if (event.ctrlKey && (event.key === 'f' || event.key === 'F')) {
       event.preventDefault();
       searchInput.focus();
     }
   });

   document.addEventListener('click', async (event) => {
    if (!event.target.classList.contains('delete-btn')) return;
    event.stopPropagation();
    const card = event.target.closest('.task-card');
    if (!card) return;
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
    const tags = parseTagsInput(document.getElementById('edit-task-tags').value);
    if (!title) return;

    await updateTask(editingTaskId, { title, description, tags });
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
