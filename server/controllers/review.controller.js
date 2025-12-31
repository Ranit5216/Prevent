import ReviewModel from "../models/review.model.js";
import ProductModel from "../models/product.model.js";
import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";

// Check if user can review a product
export const canUserReviewController = async (request, response) => {
    try {
        const { productId } = request.body;
        const userId = request.userId;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        if (!userId) {
            return response.json({
                message: "User not authenticated",
                data: { canReview: false, hasDeliveredOrder: false, hasExistingReview: false },
                error: false,
                success: true
            });
        }

        // Check if user has a delivered order for this product
        const deliveredOrder = await OrderModel.findOne({ 
            userId, 
            productId, 
            order_status: 'DELIVERED' 
        });

        // Check if user already reviewed this product
        const existingReview = await ReviewModel.findOne({ 
            productId, 
            userId, 
            status: { $ne: 'deleted' } 
        });

        const canReview = !!deliveredOrder && !existingReview;

        return response.json({
            message: "Review eligibility checked",
            data: {
                canReview,
                hasDeliveredOrder: !!deliveredOrder,
                hasExistingReview: !!existingReview,
                orderId: deliveredOrder?._id || null
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Can user review error:", error);
        return response.status(500).json({
            message: error.message || "Failed to check review eligibility",
            error: true,
            success: false
        });
    }
};

// Create a review
export const createReviewController = async (request, response) => {
    try {
        const { productId, rating, title, comment, images, orderId } = request.body;
        const userId = request.userId;

        if (!productId || !rating || !comment) {
            return response.status(400).json({
                message: "Product ID, rating, and comment are required",
                error: true,
                success: false
            });
        }

        if (rating < 1 || rating > 5) {
            return response.status(400).json({
                message: "Rating must be between 1 and 5",
                error: true,
                success: false
            });
        }

        // Check if product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return response.status(404).json({
                message: "Product not found",
                error: true,
                success: false
            });
        }

        // Check if user already reviewed this product
        const existingReview = await ReviewModel.findOne({ productId, userId, status: { $ne: 'deleted' } });
        if (existingReview) {
            return response.status(400).json({
                message: "You have already reviewed this product",
                error: true,
                success: false
            });
        }

        // Check if user has a DELIVERED order for this product (required for review)
        let verifiedPurchase = false;
        let orderIdToLink = null;
        let canReview = false;
        
        if (orderId) {
            const order = await OrderModel.findOne({ _id: orderId, userId, productId, order_status: 'DELIVERED' });
            if (order) {
                verifiedPurchase = true;
                orderIdToLink = orderId;
                canReview = true;
            }
        } else {
            // Check if user has any delivered order for this product
            const order = await OrderModel.findOne({ userId, productId, order_status: 'DELIVERED' });
            if (order) {
                verifiedPurchase = true;
                orderIdToLink = order._id;
                canReview = true;
            }
        }

        // User can only review if they have a delivered order
        if (!canReview) {
            return response.status(403).json({
                message: "You can only review products after the service is done. Please wait for your order to be marked as service done.",
                error: true,
                success: false
            });
        }

        // Get user details
        const user = await UserModel.findById(userId).select('name email avatar');
        if (!user) {
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        const review = new ReviewModel({
            productId,
            userId,
            user_details: {
                name: user.name,
                email: user.email,
                avatar: user.avatar
            },
            rating,
            title: title || "",
            comment,
            images: images || [],
            verified_purchase: verifiedPurchase,
            orderId: orderIdToLink
        });

        const savedReview = await review.save();

        return response.json({
            message: "Review submitted successfully",
            data: savedReview,
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Create review error:", error);
        return response.status(500).json({
            message: error.message || "Failed to create review",
            error: true,
            success: false
        });
    }
};

// Get reviews for a product
export const getProductReviewsController = async (request, response) => {
    try {
        const { productId, page = 1, limit = 10, filter = 'all', sort = 'recent' } = request.body;

        if (!productId) {
            return response.status(400).json({
                message: "Product ID is required",
                error: true,
                success: false
            });
        }

        // Build query
        let query = { productId, status: 'active' };

        // Apply rating filter
        if (filter !== 'all' && filter !== 'photos' && filter !== 'verified') {
            const rating = parseInt(filter);
            if (!isNaN(rating) && rating >= 1 && rating <= 5) {
                query.rating = rating;
            }
        }

        // Apply additional filters
        if (filter === 'photos') {
            query.images = { $exists: true, $ne: [], $size: { $gt: 0 } };
        }
        if (filter === 'verified') {
            query.verified_purchase = true;
        }

        // Build sort
        let sortOption = {};
        switch (sort) {
            case 'recent':
                sortOption = { createdAt: -1 };
                break;
            case 'oldest':
                sortOption = { createdAt: 1 };
                break;
            case 'highest':
                sortOption = { rating: -1, createdAt: -1 };
                break;
            case 'lowest':
                sortOption = { rating: 1, createdAt: -1 };
                break;
            case 'helpful':
                sortOption = { helpful_count: -1, createdAt: -1 };
                break;
            default:
                sortOption = { createdAt: -1 };
        }

        const skip = (page - 1) * limit;

        const [reviews, totalCount] = await Promise.all([
            ReviewModel.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email avatar'),
            ReviewModel.countDocuments(query)
        ]);

        // Calculate rating statistics
        const allReviews = await ReviewModel.find({ productId, status: 'active' });
        const ratingStats = {
            total: allReviews.length,
            average: 0,
            breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        };

        if (allReviews.length > 0) {
            const sum = allReviews.reduce((acc, review) => acc + review.rating, 0);
            ratingStats.average = (sum / allReviews.length).toFixed(1);
            
            allReviews.forEach(review => {
                ratingStats.breakdown[review.rating]++;
            });
        }

        return response.json({
            message: "Reviews fetched successfully",
            data: {
                reviews,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount,
                    limit
                },
                ratingStats
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Get reviews error:", error);
        return response.status(500).json({
            message: error.message || "Failed to fetch reviews",
            error: true,
            success: false
        });
    }
};

// Update review (only by owner)
export const updateReviewController = async (request, response) => {
    try {
        const { reviewId, rating, title, comment, images } = request.body;
        const userId = request.userId;

        if (!reviewId) {
            return response.status(400).json({
                message: "Review ID is required",
                error: true,
                success: false
            });
        }

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        // Check if user is the owner
        if (review.userId.toString() !== userId.toString()) {
            return response.status(403).json({
                message: "You can only update your own reviews",
                error: true,
                success: false
            });
        }

        // Update fields
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return response.status(400).json({
                    message: "Rating must be between 1 and 5",
                    error: true,
                    success: false
                });
            }
            review.rating = rating;
        }
        if (title !== undefined) review.title = title;
        if (comment !== undefined) review.comment = comment;
        if (images !== undefined) review.images = images;

        const updatedReview = await review.save();

        return response.json({
            message: "Review updated successfully",
            data: updatedReview,
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Update review error:", error);
        return response.status(500).json({
            message: error.message || "Failed to update review",
            error: true,
            success: false
        });
    }
};

// Delete review (by owner or admin)
export const deleteReviewController = async (request, response) => {
    try {
        const { reviewId } = request.body;
        const userId = request.userId;

        if (!reviewId) {
            return response.status(400).json({
                message: "Review ID is required",
                error: true,
                success: false
            });
        }

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        // Check if user is the owner or admin
        const user = await UserModel.findById(userId).select('role');
        const isAdmin = user?.role === 'admin';
        const isOwner = review.userId.toString() === userId.toString();

        if (!isOwner && !isAdmin) {
            return response.status(403).json({
                message: "You don't have permission to delete this review",
                error: true,
                success: false
            });
        }

        // Soft delete
        review.status = 'deleted';
        await review.save();

        return response.json({
            message: "Review deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Delete review error:", error);
        return response.status(500).json({
            message: error.message || "Failed to delete review",
            error: true,
            success: false
        });
    }
};

// Mark review as helpful
export const markHelpfulController = async (request, response) => {
    try {
        const { reviewId } = request.body;
        const userId = request.userId;

        if (!reviewId) {
            return response.status(400).json({
                message: "Review ID is required",
                error: true,
                success: false
            });
        }

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        const userIndex = review.helpful_users.findIndex(id => id.toString() === userId.toString());
        
        if (userIndex > -1) {
            // User already marked as helpful, remove it
            review.helpful_users.splice(userIndex, 1);
            review.helpful_count = Math.max(0, review.helpful_count - 1);
        } else {
            // Add user to helpful list
            review.helpful_users.push(userId);
            review.helpful_count = review.helpful_count + 1;
        }

        await review.save();

        return response.json({
            message: "Helpful status updated",
            data: {
                helpful_count: review.helpful_count,
                is_helpful: userIndex === -1
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Mark helpful error:", error);
        return response.status(500).json({
            message: error.message || "Failed to update helpful status",
            error: true,
            success: false
        });
    }
};

// Report review
export const reportReviewController = async (request, response) => {
    try {
        const { reviewId } = request.body;
        const userId = request.userId;

        if (!reviewId) {
            return response.status(400).json({
                message: "Review ID is required",
                error: true,
                success: false
            });
        }

        const review = await ReviewModel.findById(reviewId);
        if (!review) {
            return response.status(404).json({
                message: "Review not found",
                error: true,
                success: false
            });
        }

        const userIndex = review.reported_by.findIndex(id => id.toString() === userId.toString());
        
        if (userIndex === -1) {
            // Add user to reported list
            review.reported_by.push(userId);
            review.reported_count = review.reported_count + 1;
            await review.save();
        }

        return response.json({
            message: "Review reported successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Report review error:", error);
        return response.status(500).json({
            message: error.message || "Failed to report review",
            error: true,
            success: false
        });
    }
};
