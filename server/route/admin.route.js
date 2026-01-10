import { Router } from 'express';
import auth from '../middleware/auth.js';
import { isAdmin } from '../middleware/isAdmin.js';
import { 
    getDashboardAnalyticsController, 
    getSalesReportsController, 
    getCommissionDataController 
} from '../controllers/admin.controller.js';

const adminRouter = Router();

// All routes require authentication and admin privileges
adminRouter.get('/dashboard-analytics', auth, isAdmin, getDashboardAnalyticsController);
adminRouter.post('/sales-reports', auth, isAdmin, getSalesReportsController);
adminRouter.get('/commission-data', auth, isAdmin, getCommissionDataController);

export default adminRouter;


























