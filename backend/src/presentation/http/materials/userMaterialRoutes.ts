import { Router, Request, Response } from 'express';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { makeUserMaterialController } from '../../../infrastructure/services/materials/UserMaterialComposers';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { config } from '../../../config/config';
const fetch = require('node-fetch');

const userMaterialRoutes = Router();
const userMaterialController = makeUserMaterialController();

userMaterialRoutes.get('/', authMiddleware, (req: Request, res: Response, next) =>
  expressAdapter(req, res, next, userMaterialController.getMaterials.bind(userMaterialController))
);

userMaterialRoutes.get('/:id', authMiddleware, (req: Request, res: Response, next) =>
  expressAdapter(req, res, next, userMaterialController.getMaterialById.bind(userMaterialController))
);

userMaterialRoutes.post('/:id/bookmark', authMiddleware, (req: Request, res: Response, next) =>
  expressAdapter(req, res, next, userMaterialController.toggleBookmark.bind(userMaterialController))
);

userMaterialRoutes.post('/:id/like', authMiddleware, (req: Request, res: Response, next) =>
  expressAdapter(req, res, next, userMaterialController.toggleLike.bind(userMaterialController))
);

userMaterialRoutes.get('/:id/download', authMiddleware, (req: Request, res: Response, next) =>
  expressAdapter(req, res, next, userMaterialController.downloadMaterial.bind(userMaterialController))
);

userMaterialRoutes.get('/:id/download-file', authMiddleware, async (req: Request, res: Response) => {
  try {
    const materialId = req.params.id;
    const MaterialModel = require('../../../infrastructure/database/mongoose/material/MaterialModel').MaterialModel;
    const UserMaterialsRepository = require('../../../infrastructure/repositories/materials/UserMaterialsRepository').UserMaterialsRepository;
    const material = await MaterialModel.findById(materialId);
    if (!material) {
      res.status(404).send('Material not found');
      return;
    }
    const repo = new UserMaterialsRepository();
    await repo.incrementDownloads(materialId);
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

export default userMaterialRoutes