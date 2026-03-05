const express = require('express');
const { db, findTaskById } = require('../db');

const router = express.Router();

router.get('/tasks/:id/checklist', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const items = db
    .prepare('SELECT * FROM task_checklist_items WHERE task_id = ? ORDER BY sort_order ASC, id ASC')
    .all(req.params.id);

  res.json(items);
});

router.post('/tasks/:id/checklist', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (!req.body.content || String(req.body.content).trim() === '') {
    return res.status(400).json({ message: 'content is required' });
  }

  const result = db
    .prepare(
      'INSERT INTO task_checklist_items (task_id, content, is_completed, sort_order) VALUES (?, ?, ?, ?)'
    )
    .run(
      req.params.id,
      String(req.body.content).trim(),
      req.body.is_completed ? 1 : 0,
      req.body.sort_order || 0
    );

  const item = db.prepare('SELECT * FROM task_checklist_items WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(item);
});

router.put('/checklist/:itemId', (req, res) => {
  const item = db.prepare('SELECT * FROM task_checklist_items WHERE id = ?').get(req.params.itemId);

  if (!item) {
    return res.status(404).json({ message: 'Checklist item not found' });
  }

  const content = req.body.content !== undefined ? String(req.body.content).trim() : item.content;

  if (!content) {
    return res.status(400).json({ message: 'content cannot be empty' });
  }

  db.prepare(
    'UPDATE task_checklist_items SET content = ?, is_completed = ?, sort_order = ? WHERE id = ?'
  ).run(
    content,
    req.body.is_completed !== undefined ? (req.body.is_completed ? 1 : 0) : item.is_completed,
    req.body.sort_order !== undefined ? req.body.sort_order : item.sort_order,
    req.params.itemId
  );

  const updated = db.prepare('SELECT * FROM task_checklist_items WHERE id = ?').get(req.params.itemId);
  res.json(updated);
});

router.delete('/checklist/:itemId', (req, res) => {
  const item = db.prepare('SELECT * FROM task_checklist_items WHERE id = ?').get(req.params.itemId);

  if (!item) {
    return res.status(404).json({ message: 'Checklist item not found' });
  }

  db.prepare('DELETE FROM task_checklist_items WHERE id = ?').run(req.params.itemId);
  res.json({ message: 'Checklist item deleted successfully' });
});

module.exports = router;
