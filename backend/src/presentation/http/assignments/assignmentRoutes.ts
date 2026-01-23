import { Router } from 'express';
import { expressAdapter } from '../../adapters/ExpressAdapter';
import { getAssignmentComposer } from '../../../infrastructure/services/assignments/AssignmentComposers';
import { authMiddleware } from '../../../shared/middlewares/authMiddleware';
import { assignmentUpload } from '../../../config/cloudinary.config';
import { validate } from '../../../shared/middlewares/validationMiddleware';
import {
    createAssignmentSchema,
    updateAssignmentSchema,
    reviewSubmissionSchema,
    getAssignmentsQuerySchema,
    getSubmissionsQuerySchema
} from '../../../shared/validation/schemas/AssignmentSchemas';
import Logger from '../../../shared/utils/logger';

const assignmentController = getAssignmentComposer();
const router = Router();

router.get('/analytics', authMiddleware, (req, res, next) => {
    expressAdapter(req, res, next, assignmentController.getAnalytics.bind(assignmentController));
});

router.get('/download-submission-file', authMiddleware, async (req, res) => {
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

        const fetch = require('node-fetch');
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
        Logger.error('Assignment submission file download error:', err);
        res.status(500).send('Download failed');
    }
});


router.get('/',
    authMiddleware,
    validate(getAssignmentsQuerySchema, 'query'),
    (req, res, next) => {
        expressAdapter(req, res, next, assignmentController.getAssignments.bind(assignmentController));
    }
);

router.get('/:id', authMiddleware, (req, res, next) => {
    expressAdapter(req, res, next, assignmentController.getAssignmentById.bind(assignmentController));
});

router.post('/',
    authMiddleware,
    assignmentUpload.array('files', 5),
    validate(createAssignmentSchema),
    (req, res, next) => {
        expressAdapter(req, res, next, assignmentController.createAssignment.bind(assignmentController));
    }
);

router.put('/:id',
    authMiddleware,
    assignmentUpload.array('files', 5),
    validate(updateAssignmentSchema),
    (req, res, next) => {
        expressAdapter(req, res, next, assignmentController.updateAssignment.bind(assignmentController));
    }
);

router.delete('/:id', authMiddleware, (req, res, next) => {
    expressAdapter(req, res, next, assignmentController.deleteAssignment.bind(assignmentController));
});

router.get('/:assignmentId/submissions',
    authMiddleware,
    validate(getSubmissionsQuerySchema, 'query'),
    (req, res, next) => {
        expressAdapter(req, res, next, assignmentController.getSubmissions.bind(assignmentController));
    }
);

router.get('/:assignmentId/submissions/:submissionId', authMiddleware, (req, res, next) => {
    expressAdapter(req, res, next, assignmentController.getSubmissionById.bind(assignmentController));
});

router.put('/:assignmentId/submissions/:submissionId/review',
    authMiddleware,
    validate(reviewSubmissionSchema),
    (req, res, next) => {
        expressAdapter(req, res, next, assignmentController.reviewSubmission.bind(assignmentController));
    }
);



export default router;
