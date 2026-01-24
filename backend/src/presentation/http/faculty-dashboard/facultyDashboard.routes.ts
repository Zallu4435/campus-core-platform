import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getFacultyDashboardComposer } from "../../../infrastructure/services/faculty/FacultyDashboardComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import {
    getDashboardStatsSchema,
    getDashboardDataSchema,
    getWeeklyAttendanceSchema,
    getCoursePerformanceSchema,
    getSessionDistributionSchema,
    getRecentActivitiesSchema
} from "../../../shared/validation/schemas/FacultyDashboardSchemas";

const router = Router();
const facultyDashboardController = getFacultyDashboardComposer();

router.use(authMiddleware);

router.get("/stats", validate(getDashboardStatsSchema, 'query'), (req, res, next) => expressAdapter(req, res, next, facultyDashboardController.getDashboardStats.bind(facultyDashboardController)));

router.get("/data", validate(getDashboardDataSchema, 'query'), (req, res, next) => expressAdapter(req, res, next, facultyDashboardController.getDashboardData.bind(facultyDashboardController)));

router.get("/weekly-attendance", validate(getWeeklyAttendanceSchema, 'query'), (req, res, next) => expressAdapter(req, res, next, facultyDashboardController.getWeeklyAttendance.bind(facultyDashboardController)));

router.get("/assignment-performance", validate(getCoursePerformanceSchema, 'query'), (req, res, next) => expressAdapter(req, res, next, facultyDashboardController.getCoursePerformance.bind(facultyDashboardController)));

router.get("/session-distribution", validate(getSessionDistributionSchema, 'query'), (req, res, next) => expressAdapter(req, res, next, facultyDashboardController.getSessionDistribution.bind(facultyDashboardController)));

router.get("/recent-activities", validate(getRecentActivitiesSchema, 'query'), (req, res, next) => expressAdapter(req, res, next, facultyDashboardController.getRecentActivities.bind(facultyDashboardController)));


export default router; 