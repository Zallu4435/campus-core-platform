import { Router } from 'express';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { getStudentDashboardComposer } from '../../../infrastructure/services/student/StudentDashboardComposers';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { validate } from '../../../shared/middlewares/validationMiddleware';
import { StudentDashboardSchemas } from '../../../shared/validation/schemas/StudentDashboardSchemas';

const router = Router();
const studentDashboardController = getStudentDashboardComposer();

router.use(authMiddleware);


router.get('/announcements', (req, res, next) =>
  expressAdapter(req, res, next, studentDashboardController.studentDashboardController.getAnnouncements.bind(studentDashboardController.studentDashboardController))
);

router.get('/deadlines', (req, res, next) =>
  expressAdapter(req, res, next, studentDashboardController.studentDashboardController.getDeadlines.bind(studentDashboardController.studentDashboardController))
);

router.get('/classes', (req, res, next) =>
  expressAdapter(req, res, next, studentDashboardController.studentDashboardController.getClasses.bind(studentDashboardController.studentDashboardController))
);

router.get('/new-events', (req, res, next) =>
  expressAdapter(req, res, next, studentDashboardController.studentDashboardController.getNewEvents.bind(studentDashboardController.studentDashboardController))
);

router.get('/calendar-days', (req, res, next) =>
  expressAdapter(req, res, next, studentDashboardController.studentDashboardController.getCalendarDays.bind(studentDashboardController.studentDashboardController))
);

router.get('/user-info/:studentId',
  validate(StudentDashboardSchemas.getUserInfo, 'params'),
  (req, res, next) =>
    expressAdapter(req, res, next, studentDashboardController.studentDashboardController.getUserInfo.bind(studentDashboardController.studentDashboardController))
);

export default router; 