import { Router } from 'express';
import { getVideoSessionComposer } from '../../../infrastructure/services/session/SessionComposer';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { validate } from '../../../shared/middlewares/validationMiddleware';
import {
  createVideoSessionSchema,
  updateVideoSessionSchema,
  updateSessionStatusSchema,
  joinVideoSessionSchema,
  getSessionAttendanceSchema,
  updateAttendanceStatusSchema,
  sessionIdParamSchema,
  sessionAndUserParamSchema
} from '../../../shared/validation/schemas/VideoSessionSchemas';

const sessionRouter = Router();
const sessionController = getVideoSessionComposer();

sessionRouter.post('/video-sessions',
  authMiddleware,
  validate(createVideoSessionSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.createSession.bind(sessionController))
);

sessionRouter.post('/video-sessions/:id/join',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  validate(joinVideoSessionSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.joinSession.bind(sessionController))
);

sessionRouter.get('/video-sessions/:id',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.getSession.bind(sessionController))
);

sessionRouter.put('/video-sessions/:id',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  validate(updateVideoSessionSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.updateSession.bind(sessionController))
);

sessionRouter.delete('/video-sessions/:id',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.deleteSession.bind(sessionController))
);

sessionRouter.get('/video-sessions',
  authMiddleware,
  (req, res, next) => expressAdapter(req, res, next, sessionController.getAllSessions.bind(sessionController))
);

// New route for university users (lightweight data)
sessionRouter.get('/university/sessions',
  authMiddleware,
  (req, res, next) => expressAdapter(req, res, next, sessionController.getUserSessions.bind(sessionController))
);

sessionRouter.put('/video-sessions/:id/status',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  validate(updateSessionStatusSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.updateSessionStatus.bind(sessionController))
);

sessionRouter.post('/video-sessions/:id/attendance/join',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.recordAttendanceJoin.bind(sessionController))
);

sessionRouter.post('/video-sessions/:id/attendance/leave',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.recordAttendanceLeave.bind(sessionController))
);

sessionRouter.put('/video-sessions/:sessionId/attendance/:userId/status',
  authMiddleware,
  validate(sessionAndUserParamSchema, 'params'),
  validate(updateAttendanceStatusSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.updateAttendanceStatus.bind(sessionController))
);

sessionRouter.get('/video-sessions/:id/attendance',
  authMiddleware,
  validate(sessionIdParamSchema, 'params'),
  validate(getSessionAttendanceSchema, 'query'),
  (req, res, next) => expressAdapter(req, res, next, sessionController.getSessionAttendance.bind(sessionController))
);

export default sessionRouter; 