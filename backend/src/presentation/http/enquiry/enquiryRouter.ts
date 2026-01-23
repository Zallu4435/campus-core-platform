import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getEnquiryComposer } from "../../../infrastructure/services/enquiry/EnquiryComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validateRequest } from "../../../shared/middlewares/validationMiddleware";
import {
    createEnquirySchema,
    getEnquiriesSchema,
    enquiryIdParamSchema,
    updateEnquiryStatusSchema,
    sendEnquiryReplySchema
} from "../../../shared/validation/schemas/EnquirySchemas";

const enquiryRouter = Router();
const enquiryController = getEnquiryComposer();

enquiryRouter.post(
    "/",
    validateRequest(createEnquirySchema),
    (req, res, next) => expressAdapter(req, res, next, enquiryController.createEnquiry.bind(enquiryController))
);

enquiryRouter.get(
    "/",
    authMiddleware,
    validateRequest(getEnquiriesSchema),
    (req, res, next) => expressAdapter(req, res, next, enquiryController.getEnquiries.bind(enquiryController))
);

enquiryRouter.get(
    "/:id",
    authMiddleware,
    validateRequest(enquiryIdParamSchema),
    (req, res, next) => expressAdapter(req, res, next, enquiryController.getEnquiryById.bind(enquiryController))
);

enquiryRouter.patch(
    "/:id/status",
    authMiddleware,
    validateRequest(updateEnquiryStatusSchema),
    (req, res, next) => expressAdapter(req, res, next, enquiryController.updateEnquiryStatus.bind(enquiryController))
);

enquiryRouter.post(
    "/:id/reply",
    authMiddleware,
    validateRequest(sendEnquiryReplySchema),
    (req, res, next) => expressAdapter(req, res, next, enquiryController.sendReply.bind(enquiryController))
);

enquiryRouter.delete(
    "/:id",
    authMiddleware,
    validateRequest(enquiryIdParamSchema),
    (req, res, next) => expressAdapter(req, res, next, enquiryController.deleteEnquiry.bind(enquiryController))
);

export default enquiryRouter;