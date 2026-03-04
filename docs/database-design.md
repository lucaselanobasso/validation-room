# Validation Room — Database Design (V1)

## 1. Entity Overview

### `users`
Represents authenticated QA users. Each user owns only their own tasks and related validation data.

### `tasks`
Core entity for a validation unit linked to a GitHub issue/PR.
Includes metadata: title, issue number, issue URL, PR URL, status, priority, change type, and technical notes.

### `task_checklist_items`
Stores checklist steps for a task. Each item can be marked complete/incomplete.

### `task_progress_logs`
Chronological activity entries for validation progress on a task.

### `task_bugs`
Bugs identified during validation for a task, including optional link to external bug ticket.

---

## 2. Relationships Between Entities

- One `user` has many `tasks`.
- One `task` has many `task_checklist_items`.
- One `task` has many `task_progress_logs`.
- One `task` has many `task_bugs`.

In short:
- `users (1) -> (N) tasks`
- `tasks (1) -> (N) checklist_items`
- `tasks (1) -> (N) progress_logs`
- `tasks (1) -> (N) bugs`

---

## 3. Suggested Table Structure

Practical PostgreSQL-style DDL for V1:

```sql
CREATE TABLE users (
	id                BIGSERIAL PRIMARY KEY,
	email             VARCHAR(255) NOT NULL UNIQUE,
	password_hash     TEXT NOT NULL,
	created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
	id                BIGSERIAL PRIMARY KEY,
	user_id           BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	title             VARCHAR(200) NOT NULL,
	issue_number      BIGINT NOT NULL,
	issue_url         TEXT NOT NULL,
	pr_url            TEXT NOT NULL,
	status            VARCHAR(30) NOT NULL,
	priority          VARCHAR(20) NOT NULL,
	change_type       VARCHAR(30) NOT NULL,
	technical_notes   TEXT NOT NULL DEFAULT '',
	created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT chk_tasks_status
		CHECK (status IN ('To Validate', 'In Validation', 'Blocked', 'Done')),
	CONSTRAINT chk_tasks_priority
		CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
	CONSTRAINT chk_tasks_change_type
		CHECK (change_type IN ('Backend', 'Frontend', 'Database', 'Infra', 'Business Rule')),
	CONSTRAINT chk_tasks_issue_url
		CHECK (issue_url ~* '^https?://'),
	CONSTRAINT chk_tasks_pr_url
		CHECK (pr_url ~* '^https?://'),

	CONSTRAINT uq_tasks_user_issue UNIQUE (user_id, issue_number)
);

CREATE TABLE task_checklist_items (
	id                BIGSERIAL PRIMARY KEY,
	task_id           BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
	content           TEXT NOT NULL,
	is_completed      BOOLEAN NOT NULL DEFAULT FALSE,
	sort_order        INTEGER NOT NULL DEFAULT 0,
	created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_progress_logs (
	id                BIGSERIAL PRIMARY KEY,
	task_id           BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
	entry_text        TEXT NOT NULL,
	created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE task_bugs (
	id                BIGSERIAL PRIMARY KEY,
	task_id           BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
	title             VARCHAR(200) NOT NULL,
	description       TEXT NOT NULL,
	external_bug_url  TEXT,
	created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

	CONSTRAINT chk_task_bugs_external_url
		CHECK (external_bug_url IS NULL OR external_bug_url ~* '^https?://')
);
```

Notes:
- `technical_notes` is stored directly on `tasks` in V1 to keep the model simple.
- `uq_tasks_user_issue` avoids duplicate tasks for the same issue by the same user.

---

## 4. Indexing Recommendations

Start with focused indexes for common V1 queries:

```sql
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status);
CREATE INDEX idx_tasks_user_priority ON tasks(user_id, priority);
CREATE INDEX idx_tasks_user_updated_at ON tasks(user_id, updated_at DESC);

CREATE INDEX idx_checklist_task_id ON task_checklist_items(task_id);
CREATE INDEX idx_checklist_task_sort ON task_checklist_items(task_id, sort_order);

CREATE INDEX idx_progress_task_created ON task_progress_logs(task_id, created_at DESC);
CREATE INDEX idx_bugs_task_created ON task_bugs(task_id, created_at DESC);
```

Why this is enough for V1:
- Dashboard and task listing are mostly filtered by `user_id`, often with status/priority.
- Task details read child records by `task_id` and usually in chronological order.

---

## 5. Data Integrity Considerations

- **Ownership isolation:** all task-related tables reference `tasks`, and `tasks` references `users`.
- **Required fields:** enforce `NOT NULL` for core task metadata (`title`, `issue_number`, `issue_url`, `pr_url`, `status`, `priority`, `change_type`).
- **Domain constraints:** use `CHECK` constraints for status, priority, and change type allowed values.
- **URL validation (basic):** lightweight regex checks ensure URL-like values.
- **Uniqueness:** `UNIQUE (user_id, issue_number)` prevents duplicate entries for the same issue per user.
- **Cascading rules:** `ON DELETE CASCADE` removes checklist/logs/bugs when a task is deleted, and all tasks if a user is removed.
- **Timestamps:** keep `created_at` and `updated_at` on mutable entities for auditability and ordering.

---

## 6. Scalability Considerations for Future Versions (Brief)

- Keep current schema and add fields/tables incrementally instead of redesigning early.
- If status/priority/change type evolve often, migrate from `CHECK` constraints to lookup tables.
- If technical notes need revision history, add `task_note_entries` (append-only) later.
- If search needs grow, add PostgreSQL full-text indexes for notes/logs/bugs.
- If data volume grows, partition large append-only tables (e.g., `task_progress_logs`) by time.
- Add soft-delete columns only when recovery/audit requirements justify it.

This design keeps V1 straightforward, enforces core integrity rules, and leaves clean extension paths without premature complexity.
