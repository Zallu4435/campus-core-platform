import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getCoursesComposer } from "../../../infrastructure/services/courses/CourseComposers";
import { getCourseEnrollmentsComposer } from "../../../infrastructure/services/courses/CourseEnrollmentComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import {
  createCourseSchema,
  updateCourseSchema,
  getCoursesQuerySchema,
  getEnrollmentsQuerySchema
} from "../../../shared/validation/schemas/CourseSchemas";

const courseRouter = Router();
const courseController = getCoursesComposer();
const courseEnrollmentController = getCourseEnrollmentsComposer();

courseRouter.get("/course-enrollments",
  authMiddleware,
  validate(getEnrollmentsQuerySchema, 'query'),
  (req, res, next) =>
    expressAdapter(
      req,
      res,
      next,
      courseEnrollmentController.getEnrollments.bind(courseEnrollmentController)
    )
);
courseRouter.get("/course-enrollments/:id/details", authMiddleware, (req, res, next) =>
  expressAdapter(
    req,
    res,
    next,
    courseEnrollmentController.getEnrollmentDetails.bind(courseEnrollmentController)
  )
);
courseRouter.post("/course-enrollments/:id/approve", authMiddleware, (req, res, next) =>
  expressAdapter(
    req,
    res,
    next,
    courseEnrollmentController.approveEnrollment.bind(courseEnrollmentController)
  )
);
courseRouter.post("/course-enrollments/:id/reject", authMiddleware, (req, res, next) =>
  expressAdapter(
    req,
    res,
    next,
    courseEnrollmentController.rejectEnrollment.bind(courseEnrollmentController)
  )
);

courseRouter.get("/",
  authMiddleware,
  validate(getCoursesQuerySchema, 'query'),
  (req, res, next) =>
    expressAdapter(req, res, next, courseController.getCourses.bind(courseController))
);
courseRouter.get("/:id", authMiddleware, (req, res, next) =>
  expressAdapter(req, res, next, courseController.getCourseById.bind(courseController))
);
courseRouter.post("/",
  authMiddleware,
  validate(createCourseSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, courseController.createCourse.bind(courseController))
);
courseRouter.put("/:id",
  authMiddleware,
  validate(updateCourseSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, courseController.updateCourse.bind(courseController))
);
courseRouter.delete("/:id", authMiddleware, (req, res, next) =>
  expressAdapter(req, res, next, courseController.deleteCourse.bind(courseController))
);

export default courseRouter; 