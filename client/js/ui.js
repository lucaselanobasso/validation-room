import { formatDate } from './utils.js';

export function renderTasksList(container, tasks, { onDelete } = {}) {
  if (!tasks.length) {
    container.innerHTML = '<p class="empty">No tasks found. Create your first task.</p>';
    return;
  }

  container.innerHTML = tasks
    .map(
      (task) => `
        <article class="card" data-task-id="${task.id}">
          <div class="card-title-row">
            <h3>${escapeHtml(task.title)}</h3>
            <span class="mono">#${task.issue_number}</span>
          </div>
          <p class="card-meta">
            <span class="chip">${task.status}</span>
            <span class="chip">${task.priority}</span>
            <span class="chip">${task.change_type}</span>
          </p>
          <p class="muted">Updated ${formatDate(task.updated_at)}</p>
          <div class="actions">
            <a class="btn btn-primary" href="/pages/task-detail.html?id=${task.id}">Open</a>
            <button class="btn btn-danger delete-task" data-id="${task.id}">Delete</button>
          </div>
        </article>
      `
    )
    .join('');

  container.querySelectorAll('.delete-task').forEach((button) => {
    button.addEventListener('click', () => onDelete?.(button.dataset.id));
  });
}

export function renderTaskUpdateForm(form, task) {
  form.innerHTML = `
    <label>
      Title
      <input type="text" name="title" required maxlength="200" value="${escapeHtml(task.title)}" />
    </label>
    <label>
      Issue Number
      <input type="number" name="issue_number" required min="1" value="${task.issue_number}" />
    </label>
    <label>
      Issue URL
      <input type="url" name="issue_url" required value="${escapeHtml(task.issue_url)}" />
    </label>
    <label>
      PR URL
      <input type="url" name="pr_url" required value="${escapeHtml(task.pr_url)}" />
    </label>
    <label>
      Status
      <select name="status">
        ${['To Validate', 'In Validation', 'Blocked', 'Done']
          .map((item) => `<option ${item === task.status ? 'selected' : ''}>${item}</option>`)
          .join('')}
      </select>
    </label>
    <label>
      Priority
      <select name="priority">
        ${['Low', 'Medium', 'High', 'Critical']
          .map((item) => `<option ${item === task.priority ? 'selected' : ''}>${item}</option>`)
          .join('')}
      </select>
    </label>
    <label>
      Change Type
      <select name="change_type">
        ${['Backend', 'Frontend', 'Database', 'Infra', 'Business Rule']
          .map((item) => `<option ${item === task.change_type ? 'selected' : ''}>${item}</option>`)
          .join('')}
      </select>
    </label>
    <label class="full-width">
      Technical Notes
      <textarea name="technical_notes" rows="4">${escapeHtml(task.technical_notes || '')}</textarea>
    </label>
    <p class="muted full-width">Created: ${formatDate(task.created_at)} | Updated: ${formatDate(task.updated_at)}</p>
    <div class="actions full-width">
      <button type="submit" class="btn btn-primary">Save Changes</button>
    </div>
  `;
}

export function renderChecklist(list, items, { onToggle, onDelete } = {}) {
  if (!items.length) {
    list.innerHTML = '<li class="empty">No checklist items yet.</li>';
    return;
  }

  list.innerHTML = items
    .map(
      (item) => `
        <li class="list-item">
          <label class="grow">
            <input type="checkbox" data-toggle-id="${item.id}" ${item.is_completed ? 'checked' : ''} />
            <span class="${item.is_completed ? 'done' : ''}">${escapeHtml(item.content)}</span>
          </label>
          <button class="btn btn-danger small" data-delete-id="${item.id}">Delete</button>
        </li>
      `
    )
    .join('');

  list.querySelectorAll('[data-toggle-id]').forEach((checkbox) => {
    checkbox.addEventListener('change', () => onToggle?.(checkbox.dataset.toggleId, checkbox.checked));
  });

  list.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', () => onDelete?.(button.dataset.deleteId));
  });
}

export function renderProgressLogs(list, entries) {
  if (!entries.length) {
    list.innerHTML = '<li class="empty">No progress logs yet.</li>';
    return;
  }

  list.innerHTML = entries
    .map(
      (entry) => `
        <li class="list-item stack">
          <p>${escapeHtml(entry.entry_text)}</p>
          <small class="muted">${formatDate(entry.created_at)}</small>
        </li>
      `
    )
    .join('');
}

export function renderBugs(list, bugs, { onEdit, onDelete } = {}) {
  if (!bugs.length) {
    list.innerHTML = '<li class="empty">No bugs logged.</li>';
    return;
  }

  list.innerHTML = bugs
    .map(
      (bug) => `
        <li class="list-item stack">
          <div class="card-title-row">
            <strong>${escapeHtml(bug.title)}</strong>
            <small class="muted">${formatDate(bug.created_at)}</small>
          </div>
          <p>${escapeHtml(bug.description)}</p>
          ${bug.external_bug_url ? `<a href="${escapeHtml(bug.external_bug_url)}" target="_blank" rel="noreferrer">External Bug Link</a>` : ''}
          <div class="actions">
            <button class="btn btn-ghost small" data-edit-id="${bug.id}">Edit</button>
            <button class="btn btn-danger small" data-delete-id="${bug.id}">Delete</button>
          </div>
        </li>
      `
    )
    .join('');

  list.querySelectorAll('[data-edit-id]').forEach((button) => {
    button.addEventListener('click', () => onEdit?.(button.dataset.editId));
  });

  list.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', () => onDelete?.(button.dataset.deleteId));
  });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
