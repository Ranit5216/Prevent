import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.ObjectId,
        ref: 'product',
        required: [true, "Product ID is required"],
        index: true
    },
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, "User ID is required"],
        index: true
    },
    user_details: {
        name: String,
        email: String,
        avatar: String
    },
    rating: {
        type: Number,
        required: [true, "Rating is required"],
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating must be at most 5"]
    },
    title: {
        type: String,
        default: ""
    },
    comment: {
        type: String,
        required: [true, "Review comment is required"],
        trim: true
    },
    images: {
        type: Array,
        default: []
    },
    verified_purchase: {
        type: Boolean,
        default: false
    },
    orderId: {
        type: mongoose.Schema.ObjectId,
        ref: 'order',
        default: null
    },
    helpful_count: {
        type: Number,
        default: 0
    },
    helpful_users: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    reported_count: {
        type: Number,
        default: 0
    },
    reported_by: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'hidden', 'deleted'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Compound index to prevent duplicate reviews from same user for same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

// Text index for search
reviewSchema.index({ comment: "text", title: "text" });

const ReviewModel = mongoose.model('review', reviewSchema);

export default ReviewModel;

