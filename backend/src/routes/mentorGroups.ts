/**
 * routes/mentorGroups.ts
 * Handles all /api/mentor/* routes:
 *   GET  /api/mentor/groups
 *   GET  /api/mentor/groups/:groupId/topic
 *   POST /api/mentor/groups/:groupId/topic/decision
 *   POST /api/mentor/groups/:groupId/discussion
 *   POST /api/mentor/bulk-decision
 *   GET  /api/mentor/groups/:groupId/logbook
 *   POST /api/mentor/groups/:groupId/logbook
 *   PUT  /api/mentor/groups/:groupId/logbook/:entryId
 *   GET  /api/mentor/dashboard
 *   GET  /api/mentor/calendar
 * Implemented in Task 2.2
 */
import { Router } from 'express';
const router = Router();
export default router;
