import { getToken, redirectToLogin } from '../auth/session.js';

export const API_URL = '/api/tasks';

export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    redirectToLogin();
    throw new Error('Sesión expirada');
  }

  return response;
}

export async function fetchTasks() {
  const response = await authFetch(API_URL);
  return response.json();
}

export async function createTask(payload) {
  return authFetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateTask(taskId, updates) {
  return authFetch(`${API_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(taskId) {
  return authFetch(`${API_URL}/${taskId}`, { method: 'DELETE' });
}

export async function uploadAttachment(taskId, file) {
  const formData = new FormData();
  formData.append('file', file);
  return authFetch(`${API_URL}/${taskId}/attachments`, {
    method: 'POST',
    body: formData,
  });
}

export async function fetchMe() {
  const response = await authFetch('/api/auth/me');
  return response.ok ? response.json() : null;
}