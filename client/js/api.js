const API_BASE = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

export const api = {
  getTasks(filters = {}) {
    const query = new URLSearchParams(filters);
    const suffix = query.toString() ? `?${query.toString()}` : '';
    return request(`/tasks${suffix}`);
  },
  getTask(id) {
    return request(`/tasks/${id}`);
  },
  createTask(data) {
    return request('/tasks', { method: 'POST', body: JSON.stringify(data) });
  },
  updateTask(id, data) {
    return request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteTask(id) {
    return request(`/tasks/${id}`, { method: 'DELETE' });
  },
  getChecklist(taskId) {
    return request(`/tasks/${taskId}/checklist`);
  },
  createChecklist(taskId, data) {
    return request(`/tasks/${taskId}/checklist`, { method: 'POST', body: JSON.stringify(data) });
  },
  updateChecklist(itemId, data) {
    return request(`/checklist/${itemId}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteChecklist(itemId) {
    return request(`/checklist/${itemId}`, { method: 'DELETE' });
  },
  getProgressLogs(taskId) {
    return request(`/tasks/${taskId}/progress-logs`);
  },
  createProgressLog(taskId, data) {
    return request(`/tasks/${taskId}/progress-logs`, { method: 'POST', body: JSON.stringify(data) });
  },
  getBugs(taskId) {
    return request(`/tasks/${taskId}/bugs`);
  },
  createBug(taskId, data) {
    return request(`/tasks/${taskId}/bugs`, { method: 'POST', body: JSON.stringify(data) });
  },
  updateBug(bugId, data) {
    return request(`/bugs/${bugId}`, { method: 'PUT', body: JSON.stringify(data) });
  },
  deleteBug(bugId) {
    return request(`/bugs/${bugId}`, { method: 'DELETE' });
  },
};
