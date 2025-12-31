import express from 'express';
import auth from '../middleware/auth.js';
import {
    canUserReviewController,
    createReviewController,
    getProductReviewsController,
    updateReviewController,
    deleteReviewController,
    markHelpfulController,
    reportReviewController
} from '../controllers/review.controller.js';

const reviewRouter = express.Router();

// Check if user can review (authenticated)
reviewRouter.post('/can-review', auth, canUserReviewController);

// Create review (authenticated users only)
reviewRouter.post('/create', auth, createReviewController);

// Get reviews for a product (public)
reviewRouter.post('/get', getProductReviewsController);

// Update review (authenticated, owner only)
reviewRouter.put('/update', auth, updateReviewController);

// Delete review (authenticated, owner or admin)
reviewRouter.delete('/delete', auth, deleteReviewController);

// Mark review as helpful (authenticated)
reviewRouter.post('/helpful', auth, markHelpfulController);

// Report review (authenticated)
reviewRouter.post('/report', auth, reportReviewController);

export default reviewRouter;

