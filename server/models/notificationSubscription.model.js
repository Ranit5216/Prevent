import mongoose from "mongoose";

const notificationSubscriptionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    endpoint: {
        type: String,
        required: true
    },
    keys: {
        p256dh: {
            type: String,
            required: true
        },
        auth: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
});

// Ensure one subscription per user
notificationSubscriptionSchema.index({ userId: 1 }, { unique: true });

const NotificationSubscriptionModel = mongoose.model('NotificationSubscription', notificationSubscriptionSchema);

export default NotificationSubscriptionModel;

