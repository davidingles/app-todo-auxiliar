import { state } from '../state.js';
import { escapeHtml, formatTaskDate, normalizeTags, getPrimaryTag } from '../utils/format.js';
import { tagIconSvg, attachmentIconSvg } from './icons.js';
import { uploadAttachment } from '../api/client.js';

export function createCard(task, ctx) {
  const tags = normalizeTags(task.tags);
  const primaryTag = getPrimaryTag(tags, state.tagOptions);
  const formattedDate = formatTaskDate(task.updated_at);
  const tagsHtml = tags.length
    ? `<div class="task-tags">${tags.map((tag) => `<span class="task-tag" data-tag="${escapeHtml(tag.toLowerCase())}">#${escapeHtml(tag)}</span>`).join('')}</div>`
    : '';
  const dateHtml = formattedDate
    ? `<time class="task-date" datetime="${escapeHtml(task.updated_at)}">${escapeHtml(formattedDate)}</time>`
    : '';
  const card = document.createElement('article');
  card.className = 'task-card';
  card.draggable = true;
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.dataset.id = task.id;
  card.dataset.status = task.status;
  card.dataset.position = task.position;
  if (primaryTag) {
    card.dataset.tag = primaryTag;
  }

  const attachments = task.attachments || [];
  const hasAttachments = attachments.length > 0;

  card.innerHTML = `
    <div class="card-header">
      <h3>${escapeHtml(task.title)}</h3>
      <div class="card-actions">
        <button class="tag-btn card-action-btn" type="button" aria-label="Editar etiquetas" title="Editar etiquetas" tabindex="-1">${tagIconSvg()}</button>
        <button class="upload-btn card-action-btn${hasAttachments ? ' has-attachments' : ''}" type="button" aria-label="Adjuntar archivo" title="Adjuntar archivo" tabindex="-1">${attachmentIconSvg()}</button>
        <button class="delete-btn card-action-btn" type="button" aria-label="Eliminar tarea" tabindex="-1">✕</button>
      </div>
    </div>
    ${tagsHtml}
    ${dateHtml}
  `;

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.hidden = true;
  card.appendChild(fileInput);

  card.addEventListener('click', (event) => {
    if (event.target.closest('.card-action-btn')) return;
    ctx.selectTask(task.id);
  });

  card.addEventListener('click', async (event) => {
    const uploadBtn = event.target.closest('.upload-btn');
    if (!uploadBtn) return;
    event.stopPropagation();
    fileInput.click();
  });

  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    try {
      await uploadAttachment(task.id, file);
      await ctx.loadTasks();
      ctx.selectTask(task.id);
    } catch (error) {
      console.error('Error al subir archivo', error);
    }

    fileInput.value = '';
  });

  card.addEventListener('dblclick', (event) => {
    if (event.target.closest('.card-action-btn')) return;
    ctx.selectTask(task.id);
    ctx.openEditModal(task.id);
  });

  card.addEventListener('focus', () => {
    ctx.selectTask(task.id);
  });

  card.addEventListener('keydown', async (event) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      const cards = Array.from(document.querySelectorAll('.task-card'));
      const currentIndex = cards.findIndex((item) => item.dataset.id === task.id);
      const nextCard = cards[currentIndex + 1];
      if (nextCard) {
        event.preventDefault();
        nextCard.focus();
        ctx.selectTask(nextCard.dataset.id);
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
        ctx.selectTask(prevCard.dataset.id);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      ctx.selectTask(task.id);
      ctx.openEditModal(task.id);
      return;
    }

    if (event.key === 'Delete') {
      event.preventDefault();
      ctx.selectTask(task.id);
      ctx.openDeleteModal(task.id);
      return;
    }

    if (event.ctrlKey && (event.key === 'ArrowRight' || event.key === 'ArrowLeft')) {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      const nextStatus = ctx.getNextStatus(task.status, direction);
      if (nextStatus !== task.status) {
        await ctx.updateTask(task.id, { status: nextStatus, position: Date.now() });
        await ctx.loadTasks();
        ctx.selectTask(task.id);
        const updatedCard = document.querySelector(`[data-id="${task.id}"]`);
        if (updatedCard) updatedCard.focus();
      }
      return;
    }

    if (event.ctrlKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      const columnTasks = ctx.getTasksForColumn(task.status);
      const currentIndex = columnTasks.findIndex((item) => item.id === task.id);

      if (event.key === 'ArrowUp' && currentIndex > 0) {
        const prevTask = columnTasks[currentIndex - 1];
        const tempPosition = task.position;
        await ctx.updateTask(task.id, { position: prevTask.position });
        await ctx.updateTask(prevTask.id, { position: tempPosition });
        await ctx.loadTasks();
        const updatedCard = document.querySelector(`[data-id="${task.id}"]`);
        if (updatedCard) updatedCard.focus();
      } else if (event.key === 'ArrowDown' && currentIndex < columnTasks.length - 1) {
        const nextTask = columnTasks[currentIndex + 1];
        const tempPosition = task.position;
        await ctx.updateTask(task.id, { position: nextTask.position });
        await ctx.updateTask(nextTask.id, { position: tempPosition });
        await ctx.loadTasks();
        const updatedCard = document.querySelector(`[data-id="${task.id}"]`);
        if (updatedCard) updatedCard.focus();
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const columnTasks = ctx.getTasksForColumn(task.status);
      const currentIndex = columnTasks.findIndex((item) => item.id === task.id);
      if (currentIndex > 0) {
        const prevTask = columnTasks[currentIndex - 1];
        const prevCard = document.querySelector(`[data-id="${prevTask.id}"]`);
        if (prevCard) {
          prevCard.focus();
          ctx.selectTask(prevTask.id);
        }
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const columnTasks = ctx.getTasksForColumn(task.status);
      const currentIndex = columnTasks.findIndex((item) => item.id === task.id);
      if (currentIndex < columnTasks.length - 1) {
        const nextTask = columnTasks[currentIndex + 1];
        const nextCard = document.querySelector(`[data-id="${nextTask.id}"]`);
        if (nextCard) {
          nextCard.focus();
          ctx.selectTask(nextTask.id);
        }
      }
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const statuses = ctx.getStatusOrder();
      const currentStatusIndex = statuses.indexOf(task.status);
      if (currentStatusIndex > 0) {
        const prevStatus = statuses[currentStatusIndex - 1];
        const prevColumnTasks = ctx.getTasksForColumn(prevStatus);
        if (prevColumnTasks.length > 0) {
          const nextTask = prevColumnTasks[0];
          const nextCard = document.querySelector(`[data-id="${nextTask.id}"]`);
          if (nextCard) {
            nextCard.focus();
            ctx.selectTask(nextTask.id);
          }
        }
      }
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const statuses = ctx.getStatusOrder();
      const currentStatusIndex = statuses.indexOf(task.status);
      if (currentStatusIndex < statuses.length - 1) {
        const nextStatus = statuses[currentStatusIndex + 1];
        const nextColumnTasks = ctx.getTasksForColumn(nextStatus);
        if (nextColumnTasks.length > 0) {
          const nextTask = nextColumnTasks[0];
          const nextCard = document.querySelector(`[data-id="${nextTask.id}"]`);
          if (nextCard) {
            nextCard.focus();
            ctx.selectTask(nextTask.id);
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

    const draggedTask = ctx.getTasksCache().find((item) => item.id === taskId);
    if (!draggedTask) return;

    const targetStatus = task.status;
    const targetColumnTasks = ctx.getTasksForColumn(targetStatus);
    const targetIndex = targetColumnTasks.findIndex((item) => item.id === task.id);
    const isBefore = event.clientY < card.getBoundingClientRect().top + card.offsetHeight / 2;

    const referenceTasks = [...targetColumnTasks];
    const newIndex = isBefore ? targetIndex : targetIndex + 1;
    const prevTask = referenceTasks[newIndex - 1] || null;
    const nextTask = referenceTasks[newIndex] || null;
    const newPosition = ctx.computeNextPosition(prevTask, nextTask);

    await ctx.updateTask(draggedTask.id, {
      status: targetStatus,
      position: newPosition,
    });
  });

  return card;
}