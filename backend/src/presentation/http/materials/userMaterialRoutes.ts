import { Router, Request, Response } from 'express';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { UserMaterialComposers } from '../../../infrastructure/services/materials/UserMaterialComposers';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { validateRequest } from '../../../shared/middlewares/validationMiddleware';
import {
  getUserMaterialsQuerySchema,
  materialIdParamSchema
} from '../../../shared/validation/schemas/MaterialSchemas';
import { config } from '../../../config/config';

const fetch = require('node-fetch');
const userMaterialController = UserMaterialComposers.composeUserMaterialController();
const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  validateRequest(getUserMaterialsQuerySchema),
  (req, res, next) => expressAdapter(req, res, next, userMaterialController.getMaterials.bind(userMaterialController))
);

router.get(
  '/:id',
  validateRequest(materialIdParamSchema),
  (req, res, next) => expressAdapter(req, res, next, userMaterialController.getMaterialById.bind(userMaterialController))
);

router.post(
  '/bookmark/:id',
  validateRequest(materialIdParamSchema),
  (req, res, next) => expressAdapter(req, res, next, userMaterialController.toggleBookmark.bind(userMaterialController))
);

router.post(
  '/like/:id',
  validateRequest(materialIdParamSchema),
  (req, res, next) => expressAdapter(req, res, next, userMaterialController.toggleLike.bind(userMaterialController))
);

router.get(
  '/download/:id',
  validateRequest(materialIdParamSchema),
  (req, res, next) => expressAdapter(req, res, next, userMaterialController.downloadMaterial.bind(userMaterialController))
);

// Proxy download for direct file access
router.get('/:id/download-file', async (req: Request, res: Response) => {
  try {
    const materialId = req.params.id;
    const { MaterialModel } = require('../../../infrastructure/database/mongoose/material/MaterialModel');

    const material = await MaterialModel.findById(materialId);
    if (!material) {
      res.status(404).send('Material not found');
      return;
    }

    // Increment downloads via model directly here for the proxy
    await MaterialModel.findByIdAndUpdate(materialId, { $inc: { downloads: 1 } });

    let fileUrl = material.fileUrl;
    if (!/^https?:\/\//i.test(fileUrl)) {
      fileUrl = `${config.backendUrl}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
    }

    let fileName = (material.title || 'material').replace(/\s+/g, '_') + '.' + (fileUrl.split('.').pop().split('?')[0] || 'pdf');
    fileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '');
    fileName = fileName.replace(/"/g, '');

    const response = await fetch(fileUrl);
    if (!response.ok) {
      res.status(500).send('Failed to fetch file');
      return;
    }

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', response.headers.get('content-type') || 'application/octet-stream');
    response.body.pipe(res);
  } catch (err) {
    console.error('[DownloadFile] Proxy download error:', err);
    res.status(500).send('Download failed');
  }
});

export default router;