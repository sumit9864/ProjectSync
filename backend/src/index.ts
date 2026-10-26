import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// ─── Route imports (wired in Task 2.2) ───────────────────────────────────────
import authRouter        from './routes/auth';
import electivesRouter   from './routes/electives';
import groupsRouter      from './routes/groups';
import mentorsRouter     from './routes/mentors';
import preferencesRouter from './routes/preferences';
import windowsRouter     from './routes/windows';
import topicsRouter      from './routes/topics';
import githubRouter      from './routes/github';
import milestonesRouter  from './routes/milestones';
import logbookRouter     from './routes/logbook';
import notificationsRouter from './routes/notifications';
import dashboardRouter   from './routes/dashboard';
import mentorGroupsRouter from './routes/mentorGroups';
import allocationRouter  from './routes/allocation';
import adminGroupsRouter from './routes/adminGroups';
import adminMentorsRouter from './routes/adminMentors';
import adminWindowsRouter from './routes/adminWindows';
import adminDashboardRouter from './routes/adminDashboard';
import auditRouter       from './routes/audit';
import archiveRouter     from './routes/archive';

// ─── App setup ───────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT ?? 3001;

// ─── Global middleware ────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  credentials: true,           // required for cookies to be sent cross-origin
}));
app.use(express.json());
app.use(cookieParser());

// Request logger — prints every incoming request to the console
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',          authRouter);
app.use('/api/electives',     electivesRouter);
app.use('/api/groups',        groupsRouter);
app.use('/api/mentors',       mentorsRouter);
app.use('/api/preferences',   preferencesRouter);
app.use('/api/windows',       windowsRouter);
app.use('/api/topics',        topicsRouter);
app.use('/api/github',        githubRouter);
app.use('/api/milestones',    milestonesRouter);
app.use('/api/logbook',       logbookRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/dashboard',     dashboardRouter);
app.use('/api/mentor',        mentorGroupsRouter);
app.use('/api/admin/allocation', allocationRouter);
app.use('/api/admin/groups',  adminGroupsRouter);
app.use('/api/admin/mentors', adminMentorsRouter);
app.use('/api/admin/windows', adminWindowsRouter);
app.use('/api/admin/audit',   auditRouter);
app.use('/api/admin/archive', archiveRouter);
app.use('/api/admin',         adminDashboardRouter);

// ─── 404 fallback ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 ProjectSync mock server running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health\n`);
});

export default app;
