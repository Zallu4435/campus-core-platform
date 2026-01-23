import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getUserDiplomaComposer } from "../../../infrastructure/services/diploma/UserDiplomaComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import { diplomaSchemas } from "../../../shared/validation/schemas/DiplomaSchemas";

const userDiplomaRouter = Router();
const userDiplomaController = getUserDiplomaComposer();

userDiplomaRouter.use(authMiddleware);

userDiplomaRouter.get("/", validate(diplomaSchemas.getUserDiplomas, 'query'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.getUserDiplomas.bind(userDiplomaController));
});

userDiplomaRouter.get("/:id", validate(diplomaSchemas.diplomaIdParam, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.getUserDiplomaById.bind(userDiplomaController));
});

userDiplomaRouter.get("/:courseId/chapters/:chapterId", validate(diplomaSchemas.chapterParams, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.getUserDiplomaChapter.bind(userDiplomaController));
});

userDiplomaRouter.post("/:courseId/chapters/:chapterId/progress", validate(diplomaSchemas.chapterParams, 'params'), validate(diplomaSchemas.updateProgress, 'body'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.updateVideoProgress.bind(userDiplomaController));
});

userDiplomaRouter.post("/:courseId/chapters/:chapterId/complete", validate(diplomaSchemas.chapterParams, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.markChapterComplete.bind(userDiplomaController));
});

userDiplomaRouter.post("/:courseId/chapters/:chapterId/bookmark", validate(diplomaSchemas.chapterParams, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.toggleBookmark.bind(userDiplomaController));
});

userDiplomaRouter.get("/:courseId/completed-chapters", validate(diplomaSchemas.courseIdParam, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.getCompletedChapters.bind(userDiplomaController));
});

userDiplomaRouter.get("/:courseId/bookmarked-chapters", validate(diplomaSchemas.courseIdParam, 'params'), (req, res, next) => {
  expressAdapter(req, res, next, userDiplomaController.getBookmarkedChapters.bind(userDiplomaController));
});


export default userDiplomaRouter;
