import { Router, Request, Response } from 'express';
import { User as UserModel } from '../../infrastructure/database/mongoose/auth/user.model';
import { FacultyUserModel as FacultyModel } from '../../infrastructure/database/mongoose/faculty/faculty.model';
import { authMiddleware } from '../../shared/middlewares/authMiddleware';

const router = Router();

router.post('/:type/:id/fcm-token', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const { token } = req.body;

    if (!token || typeof token !== 'string') {
      res.status(400).json({ error: 'Invalid FCM token' });
      return;
    }

    if (!req.user || (req.user.userId !== id)) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    let Model: typeof UserModel | typeof FacultyModel;
    if (type === 'user') {
      Model = UserModel;
    } else if (type === 'faculty') {
      Model = FacultyModel;
    } else {
      res.status(400).json({ error: 'Invalid type' });
      return;
    }

    const updated = await (Model as typeof UserModel).findByIdAndUpdate(
      id,
      { $addToSet: { fcmTokens: token } },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ error: `${type} not found` });
      return;
    }

    res.status(200).json({ message: 'FCM token saved' });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({ error: 'Failed to save FCM token' });
  }
});

export default router;