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

export function renderTaskView(container, task, { canEdit, onEdit } = {}) {
  container.innerHTML = `
    <div class="detail-grid" aria-live="polite">
      ${renderDetailField('Title', escapeHtml(task.title))}
      ${renderDetailField('Issue Number', `#${escapeHtml(task.issue_number)}`)}
      ${renderDetailField('Issue URL', `<a href="${escapeHtml(task.issue_url)}" target="_blank" rel="noreferrer">${escapeHtml(task.issue_url)}</a>`)}
      ${renderDetailField('PR URL', `<a href="${escapeHtml(task.pr_url)}" target="_blank" rel="noreferrer">${escapeHtml(task.pr_url)}</a>`)}
      ${renderDetailField('Status', `<span class="chip">${escapeHtml(task.status)}</span>`)}
      ${renderDetailField('Priority', `<span class="chip">${escapeHtml(task.priority)}</span>`)}
      ${renderDetailField('Change Type', `<span class="chip">${escapeHtml(task.change_type)}</span>`)}
      ${renderDetailField('Technical Notes', escapeMultiline(task.technical_notes || '-'), true)}
      <div class="detail-field full-width">
        <p class="muted">Created: ${formatDate(task.created_at)} | Updated: ${formatDate(task.updated_at)}</p>
      </div>
    </div>
  `;

  const modeActions = document.getElementById('task-mode-actions');
  modeActions.innerHTML = '';

  if (canEdit) {
    const editButton = document.createElement('button');
    editButton.className = 'btn btn-primary';
    editButton.type = 'button';
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', onEdit);
    modeActions.appendChild(editButton);
  }
}

export function renderTaskEditForm(container, task, { onSave, onCancel } = {}) {
  container.innerHTML = `
    <form id="task-update-form" class="grid-form" aria-live="polite">
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
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn btn-ghost" id="cancel-task-edit">Cancel</button>
      </div>
    </form>
  `;

  const modeActions = document.getElementById('task-mode-actions');
  modeActions.innerHTML = '<span class="chip">Editing</span>';

  const form = container.querySelector('#task-update-form');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onSave?.(form);
  });

  container.querySelector('#cancel-task-edit').addEventListener('click', () => onCancel?.());
}

export function renderChecklist(list, items, { editable = true, onToggle, onDelete } = {}) {
  if (!items.length) {
    list.innerHTML = '<li class="empty">No checklist items yet.</li>';
    return;
  }

  if (!editable) {
    list.innerHTML = items
      .map(
        (item) => `
          <li class="list-item">
            <div class="grow">
              <span class="chip">${item.is_completed ? 'Done' : 'Pending'}</span>
              <span class="${item.is_completed ? 'done' : ''}">${escapeHtml(item.content)}</span>
            </div>
          </li>
        `
      )
      .join('');
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

export function renderBugs(list, bugs, { editable = true, onEdit, onDelete } = {}) {
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
          ${
            editable
              ? `<div class="actions">
                  <button class="btn btn-ghost small" data-edit-id="${bug.id}">Edit</button>
                  <button class="btn btn-danger small" data-delete-id="${bug.id}">Delete</button>
                </div>`
              : ''
          }
        </li>
      `
    )
    .join('');

  if (!editable) {
    return;
  }

  list.querySelectorAll('[data-edit-id]').forEach((button) => {
    button.addEventListener('click', () => onEdit?.(button.dataset.editId));
  });

  list.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', () => onDelete?.(button.dataset.deleteId));
  });
}

function renderDetailField(label, value, fullWidth = false) {
  return `
    <div class="detail-field ${fullWidth ? 'full-width' : ''}">
      <p class="detail-label">${label}</p>
      <div class="detail-value">${value}</div>
    </div>
  `;
}

function escapeMultiline(text) {
  return escapeHtml(text).replaceAll('\n', '<br />');
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
