import { Router, Request, Response, NextFunction } from 'express';
import { getUserAssignmentComposer } from '../../../infrastructure/services/assignments/UserAssignmentComposers';
import { assignmentSubmissionUpload, cloudinary } from '../../../config/cloudinary.config';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { validate } from '../../../shared/middlewares/validationMiddleware';
import { getAssignmentsQuerySchema } from '../../../shared/validation/schemas/AssignmentSchemas';
import Logger from '../../../shared/utils/logger';
const fetch = require('node-fetch');

const router = Router();
const userAssignmentController = getUserAssignmentComposer();


router.get('/download-reference-file', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileUrl, fileName } = req.query;

    if (!fileUrl || typeof fileUrl !== 'string') {
      Logger.error('File URL is missing or invalid');
      res.status(400).send('File URL is required');
      return;
    }

    if (!fileName || typeof fileName !== 'string') {
      Logger.error('File name is missing or invalid');
      res.status(400).send('File name is required');
      return;
    }

    let cleanFileName = fileName.replace(/\s+/g, '_');
    cleanFileName = cleanFileName.replace(/[^a-zA-Z0-9._-]/g, '');
    cleanFileName = cleanFileName.replace(/"/g, '');

    const response = await fetch(fileUrl);

    if (!response.ok) {
      Logger.error(`Failed to fetch file from URL. Status: ${response.status} ${response.statusText}`);
      res.status(500).send('Failed to fetch file');
      return;
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = `attachment; filename="${cleanFileName}"`;

    res.setHeader('Content-Disposition', contentDisposition);
    res.setHeader('Content-Type', contentType);
    response.body.pipe(res);

  } catch (err) {
    Logger.error('Assignment reference file download error:', err);
    res.status(500).send('Download failed');
  }
});

router.get('/', authMiddleware, (req, res, next) => {
  expressAdapter(req, res, next, userAssignmentController.getAssignments.bind(userAssignmentController));
});

router.get('/:id', authMiddleware, (req, res, next) => {
  expressAdapter(req, res, next, userAssignmentController.getAssignmentById.bind(userAssignmentController));
});

router.post('/:id/submit', authMiddleware, assignmentSubmissionUpload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  expressAdapter(req, res, next, userAssignmentController.submitAssignment.bind(userAssignmentController));
});

router.get('/:id/status', authMiddleware, (req, res, next) => {
  expressAdapter(req, res, next, userAssignmentController.getAssignmentStatus.bind(userAssignmentController));
});

router.get('/:id/feedback', authMiddleware, (req, res, next) => {
  expressAdapter(req, res, next, userAssignmentController.getAssignmentFeedback.bind(userAssignmentController));
});

export default router; 