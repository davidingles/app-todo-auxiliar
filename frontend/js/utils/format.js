export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatFileSize(bytes) {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function normalizeTags(tags) {
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

export function getPrimaryTag(tags, tagOptions) {
  return normalizeTags(tags).find((tag) => tagOptions.includes(tag.toLowerCase()))?.toLowerCase() || '';
}

export function parseTaskDate(value) {
  if (!value) return null;

  const parsedDate = Date.parse(value);
  if (!Number.isNaN(parsedDate)) {
    return new Date(parsedDate);
  }

  const match = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) return null;

  const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = match;
  return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
}

export function formatTaskDate(value) {
  const date = parseTaskDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function compareManualOrder(a, b) {
  return a.position - b.position;
}

export function compareDateOrder(a, b) {
  const dateA = parseTaskDate(a.updated_at)?.getTime() || 0;
  const dateB = parseTaskDate(b.updated_at)?.getTime() || 0;
  return dateB - dateA || compareManualOrder(a, b);
}

export function getTagMatchScore(task, searchTerm) {
  if (!searchTerm) return 0;

  return normalizeTags(task.tags).reduce((bestScore, tag) => {
    const normalizedTag = tag.toLowerCase();
    if (normalizedTag === searchTerm) return Math.max(bestScore, 3);
    if (normalizedTag.startsWith(searchTerm)) return Math.max(bestScore, 2);
    if (normalizedTag.includes(searchTerm)) return Math.max(bestScore, 1);
    return bestScore;
  }, 0);
}

export function compareTagOrder(a, b, searchTerm) {
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

export function sortTasks(tasks, { mode, searchTerm }) {
  const sortedTasks = [...tasks];

  if (mode === 'date') {
    return sortedTasks.sort(compareDateOrder);
  }

  if (mode === 'tags') {
    return sortedTasks.sort((a, b) => compareTagOrder(a, b, searchTerm));
  }

  return sortedTasks.sort(compareManualOrder);
}