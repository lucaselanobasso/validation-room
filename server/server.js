const express = require('express');
const cors = require('cors');

require('./db');

const tasksRoutes = require('./routes/tasks');
const checklistRoutes = require('./routes/checklist');
const progressLogsRoutes = require('./routes/progress-logs');
const bugsRoutes = require('./routes/bugs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/tasks', tasksRoutes);
app.use('/api/tasks', progressLogsRoutes);
app.use('/api', checklistRoutes);
app.use('/api', bugsRoutes);

app.use(express.static(require('path').join(__dirname, '..', 'client')));

app.listen(PORT, () => {
  console.log(`Validation Room server running on http://localhost:${PORT}`);
});
