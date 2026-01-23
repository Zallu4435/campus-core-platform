import { Router } from "express";
import { profilePictureUpload } from "../../../config/cloudinary.config";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import {
  updateProfileSchema,
  changePasswordSchema
} from "../../../shared/validation/schemas/ProfileSchemas";
import { getProfileComposer } from "../../../infrastructure/services/profile/ProfileComposers";

const profileRouter = Router();
const profileController = getProfileComposer();

profileRouter.get(
  "/",
  authMiddleware,
  (req, res, next) => expressAdapter(req, res, next, profileController.getProfile.bind(profileController))
);

profileRouter.put(
  "/",
  authMiddleware,
  validate(updateProfileSchema),
  (req, res, next) => expressAdapter(req, res, next, profileController.updateProfile.bind(profileController))
);

profileRouter.post(
  "/password",
  authMiddleware,
  validate(changePasswordSchema),
  (req, res, next) => expressAdapter(req, res, next, profileController.changePassword.bind(profileController))
);

profileRouter.post(
  "/profile-picture",
  authMiddleware,
  profilePictureUpload.single("profilePicture"),
  (req, res, next) => expressAdapter(req, res, next, profileController.updateProfilePicture.bind(profileController))
);

export default profileRouter;