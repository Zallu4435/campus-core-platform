import { Router } from 'express';
import { getAcademicComposer } from '../../../infrastructure/services/academics/AcademicComposers';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { validate } from '../../../shared/middlewares/validationMiddleware';
import {
  getCoursesSchema,
  registerCourseSchema,
  requestTranscriptSchema,
  academicHistorySchema
} from '../../../shared/validation/schemas/AcademicSchemas';

const router = Router();
const academicController = getAcademicComposer();

router.use(authMiddleware);

router.get('/student-info', (req, res, next) =>
  expressAdapter(req, res, next, academicController.getStudentInfo.bind(academicController))
);

router.get('/grade-info', (req, res, next) =>
  expressAdapter(req, res, next, academicController.getGradeInfo.bind(academicController))
);

router.get('/courses',
  validate(getCoursesSchema, 'query'),
  (req, res, next) =>
    expressAdapter(req, res, next, academicController.getCourses.bind(academicController))
);

router.get('/history',
  validate(academicHistorySchema, 'query'),
  (req, res, next) =>
    expressAdapter(req, res, next, academicController.getAcademicHistory.bind(academicController))
);

router.get('/program-info', (req, res, next) =>
  expressAdapter(req, res, next, academicController.getProgramInfo.bind(academicController))
);

router.get('/progress-info', (req, res, next) =>
  expressAdapter(req, res, next, academicController.getProgressInfo.bind(academicController))
);

router.get('/requirements-info', (req, res, next) =>
  expressAdapter(req, res, next, academicController.getRequirementsInfo.bind(academicController))
);

router.post('/register/:courseId',
  validate(registerCourseSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, academicController.registerCourse.bind(academicController))
);

router.delete('/register/:courseId', (req, res, next) =>
  expressAdapter(req, res, next, academicController.dropCourse.bind(academicController))
);

router.post('/request-transcript',
  validate(requestTranscriptSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, academicController.requestTranscript.bind(academicController))
);

export default router;