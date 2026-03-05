import { api } from './api.js';
import { getTaskIdFromUrl, showToast } from './utils.js';
import {
  renderBugs,
  renderChecklist,
  renderProgressLogs,
  renderTaskEditForm,
  renderTaskView,
  renderTasksList,
} from './ui.js';

const page = document.body.dataset.page;

if (page === 'dashboard') {
  initDashboard().catch(handleError);
}

if (page === 'task-detail') {
  initTaskDetail().catch(handleError);
}

async function initDashboard() {
  const taskFormPanel = document.getElementById('task-form-panel');
  const taskForm = document.getElementById('task-form');
  const tasksList = document.getElementById('tasks-list');
  const statusFilter = document.getElementById('filter-status');
  const priorityFilter = document.getElementById('filter-priority');

  document.getElementById('toggle-task-form').addEventListener('click', () => {
    taskFormPanel.classList.remove('hidden');
  });

  document.getElementById('cancel-task-form').addEventListener('click', () => {
    taskForm.reset();
    taskFormPanel.classList.add('hidden');
  });

  taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = formDataToObject(taskForm);

    try {
      const task = await api.createTask(data);
      showToast('Task created successfully');
      window.location.href = `/pages/task-detail.html?id=${task.id}`;
    } catch (error) {
      handleError(error);
    }
  });

  statusFilter.addEventListener('change', loadTasks);
  priorityFilter.addEventListener('change', loadTasks);

  async function loadTasks() {
    const filters = {};

    if (statusFilter.value) filters.status = statusFilter.value;
    if (priorityFilter.value) filters.priority = priorityFilter.value;

    const tasks = await api.getTasks(filters);
    renderTasksList(tasksList, tasks, {
      onDelete: async (taskId) => {
        const shouldDelete = window.confirm('Delete task and all related data?');
        if (!shouldDelete) return;

        await api.deleteTask(taskId);
        showToast('Task deleted');
        await loadTasks();
      },
    });
  }

  await loadTasks();
}

async function initTaskDetail() {
  const taskId = getTaskIdFromUrl();

  if (!taskId) {
    throw new Error('Missing task id in URL');
  }

  const taskInfoContent = document.getElementById('task-info-content');
  const checklistForm = document.getElementById('checklist-form');
  const progressForm = document.getElementById('progress-form');
  const bugForm = document.getElementById('bug-form');
  const canEdit = hasEditPermission();

  let isEditing = false;
  let taskSnapshot = null;

  setSectionMode();

  async function loadTask() {
    taskSnapshot = await api.getTask(taskId);
    renderTaskSection();
  }

  function renderTaskSection() {
    if (!taskSnapshot) return;

    if (!isEditing) {
      renderTaskView(taskInfoContent, taskSnapshot, {
        canEdit,
        onEdit: () => enterEditMode(),
      });
      return;
    }

    renderTaskEditForm(taskInfoContent, taskSnapshot, {
      onSave: async (form) => {
        const data = formDataToObject(form);
        await api.updateTask(taskId, data);
        showToast('Task updated');
        taskSnapshot = await api.getTask(taskId);
        exitEditMode();
      },
      onCancel: () => {
        exitEditMode();
      },
    });

    const firstInput = taskInfoContent.querySelector('input, select, textarea');
    firstInput?.focus();
  }

  function enterEditMode() {
    if (!canEdit) return;
    isEditing = true;
    setSectionMode();
    renderTaskSection();
    loadChecklist().catch(handleError);
    loadBugs().catch(handleError);
  }

  function exitEditMode() {
    isEditing = false;
    setSectionMode();
    renderTaskSection();
    loadChecklist().catch(handleError);
    loadBugs().catch(handleError);
  }

  function setSectionMode() {
    const editable = canEdit;
    checklistForm.classList.toggle('hidden', !editable);
    progressForm.classList.toggle('hidden', !editable);
    bugForm.classList.toggle('hidden', !editable);
  }

  async function loadChecklist() {
    const items = await api.getChecklist(taskId);
    const list = document.getElementById('checklist-list');
    const editable = canEdit;

    renderChecklist(list, items, {
      editable,
      onToggle: async (itemId, checked) => {
        if (!editable) return;
        const target = items.find((item) => String(item.id) === String(itemId));
        await api.updateChecklist(itemId, {
          content: target.content,
          is_completed: checked,
          sort_order: target.sort_order,
        });
        await loadChecklist();
      },
      onDelete: async (itemId) => {
        if (!editable) return;
        await api.deleteChecklist(itemId);
        showToast('Checklist item removed');
        await loadChecklist();
      },
    });
  }

  async function loadProgressLogs() {
    const logs = await api.getProgressLogs(taskId);
    renderProgressLogs(document.getElementById('progress-list'), logs);
  }

  async function loadBugs() {
    const bugs = await api.getBugs(taskId);
    const editable = canEdit;

    renderBugs(document.getElementById('bugs-list'), bugs, {
      editable,
      onDelete: async (bugId) => {
        if (!editable) return;
        await api.deleteBug(bugId);
        showToast('Bug removed');
        await loadBugs();
      },
      onEdit: async (bugId) => {
        if (!editable) return;
        const current = bugs.find((bug) => String(bug.id) === String(bugId));
        if (!current) return;

        const title = window.prompt('Bug title', current.title);
        if (title === null) return;

        const description = window.prompt('Bug description', current.description);
        if (description === null) return;

        const external_bug_url = window.prompt('External URL (optional)', current.external_bug_url || '');
        if (external_bug_url === null) return;

        await api.updateBug(bugId, { title, description, external_bug_url });
        showToast('Bug updated');
        await loadBugs();
      },
    });
  }

  async function loadAll() {
    await Promise.all([loadTask(), loadChecklist(), loadProgressLogs(), loadBugs()]);
  }

  checklistForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!canEdit) return;
    try {
      const data = formDataToObject(checklistForm);
      await api.createChecklist(taskId, data);
      checklistForm.reset();
      showToast('Checklist item added');
      await loadChecklist();
    } catch (error) {
      handleError(error);
    }
  });

  progressForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!canEdit) return;
    try {
      const data = formDataToObject(progressForm);
      await api.createProgressLog(taskId, data);
      progressForm.reset();
      showToast('Progress log added');
      await loadProgressLogs();
    } catch (error) {
      handleError(error);
    }
  });

  bugForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!canEdit) return;
    try {
      const data = formDataToObject(bugForm);
      await api.createBug(taskId, data);
      bugForm.reset();
      showToast('Bug added');
      await loadBugs();
    } catch (error) {
      handleError(error);
    }
  });

  await loadAll();
}

function hasEditPermission() {
  const params = new URLSearchParams(window.location.search);
  const queryFlag = params.get('canEdit');

  if (queryFlag !== null) {
    return !['0', 'false', 'no'].includes(queryFlag.toLowerCase());
  }

  return true;
}

function formDataToObject(form) {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function handleError(error) {
  console.error(error);
  showToast(error.message || 'Unexpected error', 'error');
}
