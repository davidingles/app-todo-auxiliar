import { state } from '../state.js';
import { getFocusableElements } from '../utils/dom.js';
import { escapeHtml, formatFileSize, normalizeTags } from '../utils/format.js';
import { API_URL } from '../api/client.js';

export function getSelectedTags() {
  const sel = document.getElementById('edit-task-tags');
  const val = sel.value;
  return val ? [val] : [];
}

export function setSelectedTags(tags) {
  const normalized = normalizeTags(tags).map((t) => t.toLowerCase());
  const firstTag = normalized.find((t) => state.tagOptions.includes(t));
  const sel = document.getElementById('edit-task-tags');
  sel.value = firstTag || '';
}

export function openDeleteModal(taskId) {
  state.deleteTargetId = taskId;
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  state.lastFocusedElement = document.activeElement;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  const deleteButton = document.getElementById('confirm-delete');
  if (deleteButton) deleteButton.focus();
}

export function closeDeleteModal() {
  state.deleteTargetId = null;
  const modal = document.getElementById('confirm-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
  if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === 'function') {
    state.lastFocusedElement.focus();
  }
  state.lastFocusedElement = null;
}

export function openEditModal(taskId, focusTarget = 'title') {
  const task = state.tasksCache.find((item) => item.id === taskId);
  if (!task) return;

  state.editingTaskId = taskId;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-description').value = task.description || '';
  setSelectedTags(task.tags);

  const attachmentsContainer = document.getElementById('edit-task-attachments');
  const attachments = task.attachments || [];
  if (attachments.length > 0) {
    attachmentsContainer.classList.remove('hidden');
    attachmentsContainer.innerHTML = `
      <span class="attachment-label">Archivos adjuntos</span>
      <div class="attachment-list">
        ${attachments.map((att) => `
          <a class="attachment-item" href="${API_URL.replace('/api/tasks', '/uploads')}/${encodeURIComponent(att.filename)}" target="_blank" title="${escapeHtml(att.originalName)}" download>
            <span class="attachment-file-icon">📎</span>
            <span class="attachment-file-name">${escapeHtml(att.originalName)}</span>
            <span class="attachment-file-size">${formatFileSize(att.size)}</span>
          </a>
        `).join('')}
      </div>
    `;
  } else {
    attachmentsContainer.classList.add('hidden');
    attachmentsContainer.innerHTML = '';
  }

  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');
  const focusElement = focusTarget === 'tags'
    ? document.getElementById('edit-task-tags')
    : document.getElementById('edit-task-title');
  focusElement.focus();
}

export function closeEditModal() {
  state.editingTaskId = null;
  const modal = document.getElementById('edit-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');
}

export function handleModalKeydown(event) {
  if (event.key === 'Escape') {
    const editModal = document.getElementById('edit-modal');
    const confirmModal = document.getElementById('confirm-modal');
    if (editModal && !editModal.classList.contains('hidden')) {
      closeEditModal();
      return;
    }
    if (confirmModal && !confirmModal.classList.contains('hidden')) {
      closeDeleteModal();
      return;
    }
  }

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