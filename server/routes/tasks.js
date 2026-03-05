const express = require('express');
const { db, findTaskById } = require('../db');

const router = express.Router();

const allowedStatus = ['To Validate', 'In Validation', 'Blocked', 'Done'];
const allowedPriority = ['Low', 'Medium', 'High', 'Critical'];
const allowedChangeType = ['Backend', 'Frontend', 'Database', 'Infra', 'Business Rule'];

function validateTaskPayload(body, isUpdate = false) {
  const requiredFields = ['title', 'issue_number', 'issue_url', 'pr_url'];

  if (!isUpdate) {
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
        return `${field} is required`;
      }
    }
  }

  if (body.status && !allowedStatus.includes(body.status)) {
    return `status must be one of: ${allowedStatus.join(', ')}`;
  }

  if (body.priority && !allowedPriority.includes(body.priority)) {
    return `priority must be one of: ${allowedPriority.join(', ')}`;
  }

  if (body.change_type && !allowedChangeType.includes(body.change_type)) {
    return `change_type must be one of: ${allowedChangeType.join(', ')}`;
  }

  if (body.issue_number !== undefined) {
    const issueNumber = Number(body.issue_number);
    if (!Number.isFinite(issueNumber) || issueNumber <= 0) {
      return 'issue_number must be a positive number';
    }
  }

  const urlFields = ['issue_url', 'pr_url'];
  for (const field of urlFields) {
    if (body[field] !== undefined && !/^https?:\/\//i.test(String(body[field]).trim())) {
      return `${field} must start with http:// or https://`;
    }
  }

  return null;
}

router.get('/', (req, res) => {
  const { status, priority } = req.query;
  const filters = [];
  const params = [];

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  if (priority) {
    filters.push('priority = ?');
    params.push(priority);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const stmt = db.prepare(`SELECT * FROM tasks ${whereClause} ORDER BY updated_at DESC, id DESC`);
  const tasks = stmt.all(...params);

  res.json(tasks);
});

router.get('/:id', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  res.json(task);
});

router.post('/', (req, res) => {
  const error = validateTaskPayload(req.body);

  if (error) {
    return res.status(400).json({ message: error });
  }

  const stmt = db.prepare(`
    INSERT INTO tasks (title, issue_number, issue_url, pr_url, status, priority, change_type, technical_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    String(req.body.title).trim(),
    Number(req.body.issue_number),
    String(req.body.issue_url).trim(),
    String(req.body.pr_url).trim(),
    req.body.status || 'To Validate',
    req.body.priority || 'Medium',
    req.body.change_type || 'Backend',
    req.body.technical_notes || ''
  );

  const task = findTaskById(result.lastInsertRowid);
  res.status(201).json(task);
});

router.put('/:id', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const error = validateTaskPayload(req.body, true);
  if (error) {
    return res.status(400).json({ message: error });
  }

  const updatedTask = {
    title: req.body.title !== undefined ? String(req.body.title).trim() : task.title,
    issue_number: req.body.issue_number !== undefined ? Number(req.body.issue_number) : task.issue_number,
    issue_url: req.body.issue_url !== undefined ? String(req.body.issue_url).trim() : task.issue_url,
    pr_url: req.body.pr_url !== undefined ? String(req.body.pr_url).trim() : task.pr_url,
    status: req.body.status || task.status,
    priority: req.body.priority || task.priority,
    change_type: req.body.change_type || task.change_type,
    technical_notes: req.body.technical_notes !== undefined ? req.body.technical_notes : task.technical_notes,
  };

  db.prepare(`
    UPDATE tasks
    SET title = ?, issue_number = ?, issue_url = ?, pr_url = ?, status = ?, priority = ?, change_type = ?, technical_notes = ?
    WHERE id = ?
  `).run(
    updatedTask.title,
    updatedTask.issue_number,
    updatedTask.issue_url,
    updatedTask.pr_url,
    updatedTask.status,
    updatedTask.priority,
    updatedTask.change_type,
    updatedTask.technical_notes,
    req.params.id
  );

  res.json(findTaskById(req.params.id));
});

router.delete('/:id', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  res.json({ message: 'Task deleted successfully' });
});

module.exports = router;
