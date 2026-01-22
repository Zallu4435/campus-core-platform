import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getAuthComposer } from "../../../infrastructure/services/auth/AuthComposers";
import { facultyUpload } from "../../../config/cloudinary.config";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  registerFacultySchema,
  sendEmailOtpSchema,
  verifyEmailOtpSchema,
  resetPasswordSchema
} from "../../../shared/validation/schemas/AuthSchemas";
import { FACULTY_UPLOAD_CONSTANTS } from "../../../application/auth/constants/AuthConstants";

const authRouter = Router();
const authController = getAuthComposer();

authRouter.post(
  "/register",
  validate(registerSchema),
  (req, res, next) => expressAdapter(req, res, next, authController.register.bind(authController))
);

authRouter.post(
  "/login",
  validate(loginSchema),
  (req, res, next) => expressAdapter(req, res, next, authController.login.bind(authController))
);

authRouter.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  (req, res, next) => expressAdapter(req, res, next, authController.refreshToken.bind(authController))
);

authRouter.post("/logout", (req, res, next) => expressAdapter(req, res, next, authController.logout.bind(authController)));

authRouter.post("/logout-all", (req, res, next) => expressAdapter(req, res, next, authController.logoutAll.bind(authController)));

authRouter.post(
  "/faculty/request",
  facultyUpload.fields([
    { name: FACULTY_UPLOAD_CONSTANTS.FIELDS.CV, maxCount: FACULTY_UPLOAD_CONSTANTS.LIMITS.CV_MAX_COUNT },
    { name: FACULTY_UPLOAD_CONSTANTS.FIELDS.CERTIFICATES, maxCount: FACULTY_UPLOAD_CONSTANTS.LIMITS.CERTIFICATES_MAX_COUNT },
  ]),
  // Note: For multipart/form-data with file uploads, validation might need special handling
  // or be done inside the controller after parsing. 
  // Standard Joi middleware works on req.body which is populated by multer.
  validate(registerFacultySchema),
  (req, res, next) => expressAdapter(req, res, next, authController.registerFaculty.bind(authController))
);

authRouter.post(
  "/send-email-otp",
  validate(sendEmailOtpSchema),
  (req, res, next) => expressAdapter(req, res, next, authController.sendEmailOtp.bind(authController))
);

authRouter.post(
  "/verify-email-otp",
  validate(verifyEmailOtpSchema),
  (req, res, next) => expressAdapter(req, res, next, authController.verifyEmailOtp.bind(authController))
);

authRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  (req, res, next) => expressAdapter(req, res, next, authController.resetPassword.bind(authController))
);

authRouter.post("/confirm-registration", (req, res, next) => expressAdapter(req, res, next, authController.confirmRegistration.bind(authController)));

authRouter.get("/me", authMiddleware, (req, res, next) => expressAdapter(req, res, next, authController.me.bind(authController)));

export default authRouter;