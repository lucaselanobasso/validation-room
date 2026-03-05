const express = require('express');
const { db, findTaskById } = require('../db');

const router = express.Router();

router.get('/tasks/:id/bugs', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  const bugs = db
    .prepare('SELECT * FROM task_bugs WHERE task_id = ? ORDER BY created_at DESC, id DESC')
    .all(req.params.id);

  res.json(bugs);
});

router.post('/tasks/:id/bugs', (req, res) => {
  const task = findTaskById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  if (!req.body.title || String(req.body.title).trim() === '') {
    return res.status(400).json({ message: 'title is required' });
  }

  if (!req.body.description || String(req.body.description).trim() === '') {
    return res.status(400).json({ message: 'description is required' });
  }

  const result = db
    .prepare('INSERT INTO task_bugs (task_id, title, description, external_bug_url) VALUES (?, ?, ?, ?)')
    .run(
      req.params.id,
      String(req.body.title).trim(),
      String(req.body.description).trim(),
      req.body.external_bug_url ? String(req.body.external_bug_url).trim() : null
    );

  const bug = db.prepare('SELECT * FROM task_bugs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(bug);
});

router.put('/bugs/:bugId', (req, res) => {
  const bug = db.prepare('SELECT * FROM task_bugs WHERE id = ?').get(req.params.bugId);

  if (!bug) {
    return res.status(404).json({ message: 'Bug not found' });
  }

  const title = req.body.title !== undefined ? String(req.body.title).trim() : bug.title;
  const description = req.body.description !== undefined ? String(req.body.description).trim() : bug.description;

  if (!title) {
    return res.status(400).json({ message: 'title cannot be empty' });
  }

  if (!description) {
    return res.status(400).json({ message: 'description cannot be empty' });
  }

  db.prepare('UPDATE task_bugs SET title = ?, description = ?, external_bug_url = ? WHERE id = ?').run(
    title,
    description,
    req.body.external_bug_url !== undefined
      ? req.body.external_bug_url || null
      : bug.external_bug_url,
    req.params.bugId
  );

  const updated = db.prepare('SELECT * FROM task_bugs WHERE id = ?').get(req.params.bugId);
  res.json(updated);
});

router.delete('/bugs/:bugId', (req, res) => {
  const bug = db.prepare('SELECT * FROM task_bugs WHERE id = ?').get(req.params.bugId);

  if (!bug) {
    return res.status(404).json({ message: 'Bug not found' });
  }

  db.prepare('DELETE FROM task_bugs WHERE id = ?').run(req.params.bugId);
  res.json({ message: 'Bug deleted successfully' });
});

module.exports = router;
