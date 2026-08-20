export function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

export function sanitizeTags(tags) {
  let source = [];

  if (Array.isArray(tags)) {
    source = tags;
  } else if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      source = Array.isArray(parsed) ? parsed : tags.split(',');
    } catch {
      source = tags.split(',');
    }
  }

  const seen = new Set();
  return source
    .map((tag) => String(tag).trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

export function serializeTask(task) {
  let attachments = [];
  try {
    attachments = JSON.parse(task.attachments || '[]');
  } catch {
    attachments = [];
  }

  return {
    ...task,
    tags: sanitizeTags(task.tags),
    attachments,
  };
}