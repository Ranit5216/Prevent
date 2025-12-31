import { Router } from 'express';
import { saveSubscriptionController, removeSubscriptionController } from '../controllers/notification.controller.js';
import auth from '../middleware/auth.js';

const notificationRouter = Router();

// All routes require authentication
notificationRouter.post('/subscribe', auth, saveSubscriptionController);
notificationRouter.delete('/unsubscribe', auth, removeSubscriptionController);

export default notificationRouter;

