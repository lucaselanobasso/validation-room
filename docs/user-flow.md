# Validation Room — User Flow

## 1. High-Level User Journey
1. User lands on Validation Room and creates an account (or logs in).
2. User enters the personal dashboard and sees their validation workspace.
3. User creates a new validation task based on a GitHub issue.
4. User works inside the task: adds notes, checklist items, progress logs, and identified bugs.
5. User updates status and priority as validation advances.
6. User completes validation and marks task as done.
7. User returns to dashboard to continue with remaining tasks.

## 2. Step-by-Step Interaction Flow

### A. Authentication Flow
1. User opens the app.
2. User chooses **Register** (new user) or **Login** (existing user).
3. User submits email and password.
4. On success, user is taken to dashboard.

### B. Create Task Flow
1. From dashboard, user selects **Create Task**.
2. User fills required task fields:
   - Title
   - Issue number
   - Issue URL
    - PR URL (linked to the issue)
   - Status
   - Priority
   - Change type (Backend, Frontend, Database, Infra, Business Rule)
3. User saves task.
4. User is redirected to Task Details page.

### C. Manage Task Flow
1. User lands on Task Details page.
2. User adds or updates technical notes.
3. User creates and checks/unchecks validation checklist items.
4. User adds progress entries as work happens (chronological and timestamped).
5. User registers identified bugs found during validation.
6. User updates status and priority based on progress.
7. User marks task as completed when validation is finished.

### D. Ongoing Workflow Flow
1. User returns to dashboard.
2. User scans personal tasks by current status and priority.
3. User re-enters tasks to continue validation work.
4. User repeats until all active tasks are complete.

## 3. Main Screens Description

### Login / Register
**Purpose:** authenticate access and establish personal workspace ownership.

**Primary content:**
- Email field
- Password field
- Primary action (Login or Register)
- Link to switch between Login and Register

**Expected outcome:**
- Successful authentication routes user to their own dashboard.

### Dashboard
**Purpose:** provide a clear personal overview of all validation tasks.

**Primary content:**
- Task list (only tasks created by the logged-in user)
- Key task attributes visible at a glance:
  - Title
  - Issue number
  - Status
  - Priority
  - Change type
- Primary action to create a new task

**Expected outcome:**
- User quickly decides what to work on next and opens or creates tasks.

### Create Task
**Purpose:** capture all core metadata needed to start validation.

**Primary content:**
- Required inputs: title, issue number, issue URL, PR URL (linked to the issue), status, priority, change type
- Save/Cancel actions

**Expected outcome:**
- New task is created and available in dashboard and Task Details.

### Task Details Page
**Purpose:** act as the central workspace for executing and tracking validation of one task.

**Primary content sections:**
- Task header information (title, issue details, PR URL, status, priority, change type)
- Technical notes area
- Validation checklist
- Progress log (timestamped entries)
- Identified bugs list

**Expected outcome:**
- User can run end-to-end validation tracking for one issue without leaving the task context.

## 4. Key UX Principles
- **Single-task focus:** Task Details should feel like a focused validation workspace, not a crowded project board.
- **Low-friction capture:** Adding notes, checklist items, logs, and bugs should be fast and interruption-free.
- **Clarity of status:** Current task state (status + priority) should always be visible and easy to update.
- **Personal ownership:** User always sees only their tasks, reinforcing a private and reliable workspace.
- **Progress visibility:** The flow should make “what’s done vs what’s pending” obvious at every moment.
- **Consistency:** Similar actions (add, edit, save) should behave the same across all task sections.

## 5. Edge Cases to Consider
- **First-time user / empty dashboard:** show clear guidance and a strong call-to-action to create first task.
- **No tasks match current state:** if user has no active tasks or no completed tasks, display informative empty messages.
- **Accidental task deletion:** require explicit confirmation and provide clear consequence messaging.
- **Long-running tasks with many logs/checklist items:** preserve readability and scanning clarity.
- **User leaves task mid-work:** unsaved changes should be clearly communicated before navigation.
- **Invalid external links (issue or PR URL):** show clear validation feedback and correction path.
- **Authentication errors:** show straightforward recovery messages for invalid credentials.
- **Post-login with no prior activity:** route to dashboard with onboarding-friendly empty state.

---

This flow defines the core user experience for Validation Room V1: a simple, personal, and structured QA validation workspace separate from GitHub board complexity.
