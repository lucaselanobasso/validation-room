const express = require('express');
const { db, findTaskById } = require('../db');

const router = express.Router();

router.get('/:id/progress-logs', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const logs = db
    .prepare('SELECT * FROM task_progress_logs WHERE task_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.params.id);

  res.json(logs);
});

router.post('/:id/progress-logs', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (!req.body.entry_text || String(req.body.entry_text).trim() === '') {
    return res.status(400).json({ message: 'entry_text is required' });
  }

  const result = db
    .prepare('INSERT INTO task_progress_logs (task_id, entry_text) VALUES (?, ?)')
    .run(req.params.id, String(req.body.entry_text).trim());

  const entry = db.prepare('SELECT * FROM task_progress_logs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(entry);
});

module.exports = router;
