const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const schema = `
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(200) NOT NULL,
  issue_number BIGINT NOT NULL,
  issue_url TEXT NOT NULL,
  pr_url TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'To Validate',
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  change_type VARCHAR(30) NOT NULL DEFAULT 'Backend',
  technical_notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_progress_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  entry_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_bugs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  external_bug_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_checklist_task_id ON task_checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_progress_task_id ON task_progress_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_bugs_task_id ON task_bugs(task_id);

CREATE TRIGGER IF NOT EXISTS trg_tasks_updated_at
AFTER UPDATE ON tasks
FOR EACH ROW
BEGIN
  UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_checklist_updated_at
AFTER UPDATE ON task_checklist_items
FOR EACH ROW
BEGIN
  UPDATE task_checklist_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_bugs_updated_at
AFTER UPDATE ON task_bugs
FOR EACH ROW
BEGIN
  UPDATE task_bugs SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
`;

db.exec(schema);

function findTaskById(id) {
  return db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
}

module.exports = {
  db,
  findTaskById,
};
