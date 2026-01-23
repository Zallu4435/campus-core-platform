import { Router } from 'express';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { getSiteSectionsComposer } from '../../../infrastructure/services/site-management/SiteSectionComposers';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { validateRequest } from '../../../shared/middlewares/validationMiddleware';
import { SiteManagementSchemas } from '../../../shared/validation/schemas/SiteManagementSchemas';
import { siteSectionImageUpload } from '../../../config/cloudinary.config';

const SiteSectionRouter = Router();
const SiteSectionController = getSiteSectionsComposer();

SiteSectionRouter.use(authMiddleware);

SiteSectionRouter.get(
  '/',
  validateRequest(SiteManagementSchemas.getSectionsSchema),
  (req, res, next) => expressAdapter(req, res, next, SiteSectionController.getSections.bind(SiteSectionController))
);

SiteSectionRouter.get(
  '/:id',
  (req, res, next) => expressAdapter(req, res, next, SiteSectionController.getSectionById.bind(SiteSectionController))
);

SiteSectionRouter.post(
  '/',
  siteSectionImageUpload.single('image'),
  validateRequest(SiteManagementSchemas.createSectionSchema),
  (req, res, next) => expressAdapter(req, res, next, SiteSectionController.createSection.bind(SiteSectionController))
);

SiteSectionRouter.put(
  '/:id',
  siteSectionImageUpload.single('image'),
  validateRequest(SiteManagementSchemas.updateSectionSchema),
  (req, res, next) => expressAdapter(req, res, next, SiteSectionController.updateSection.bind(SiteSectionController))
);

SiteSectionRouter.delete(
  '/:id',
  (req, res, next) => expressAdapter(req, res, next, SiteSectionController.deleteSection.bind(SiteSectionController))
);

export default SiteSectionRouter;