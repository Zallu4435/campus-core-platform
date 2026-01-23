import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getVideoComposer } from "../../../infrastructure/services/video/VideoComposers";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import { getVideosSchema, createVideoSchema, updateVideoSchema } from "../../../shared/validation/schemas/VideoSchemas";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { contentVideoUpload as videoUpload } from "../../../config/cloudinary.config";
import { VideoConstants } from "../../../application/video/constants/VideoConstants";

const videoRouter = Router();
const videoController = getVideoComposer();

videoRouter.use(authMiddleware);

videoRouter.get(
    "/",
    validate(getVideosSchema, 'query'),
    (req, res, next) => expressAdapter(req, res, next, videoController.getVideos.bind(videoController))
);

videoRouter.get(
    "/:id",
    (req, res, next) => expressAdapter(req, res, next, videoController.getVideoById.bind(videoController))
);

videoRouter.post(
    "/",
    videoUpload.single('videoFile'),
    validate(createVideoSchema),
    (req, res, next) => expressAdapter(req, res, next, videoController.createVideo.bind(videoController))
);

videoRouter.put(
    "/:id",
    videoUpload.single('videoFile'),
    validate(updateVideoSchema),
    (req, res, next) => expressAdapter(req, res, next, videoController.updateVideo.bind(videoController))
);

videoRouter.delete(
    "/:id",
    (req, res, next) => expressAdapter(req, res, next, videoController.deleteVideo.bind(videoController))
);

export default videoRouter;