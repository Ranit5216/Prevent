import NotificationSubscriptionModel from "../models/notificationSubscription.model.js";
import UserModel from "../models/user.model.js";
import webpush from 'web-push';

// Configure web-push (VAPID keys should be in .env)
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:tradeoxford123@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

// Save notification subscription
export async function saveSubscriptionController(request, response) {
    try {
        const userId = request.userId;
        const { endpoint, keys } = request.body;

        console.log(`📥 Received subscription request from user ${userId}`);
        console.log(`📋 Subscription data:`, {
            hasEndpoint: !!endpoint,
            hasKeys: !!(keys && keys.p256dh && keys.auth),
            endpointPreview: endpoint ? endpoint.substring(0, 50) + '...' : 'missing'
        });

        if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
            console.error('❌ Invalid subscription data received');
            return response.status(400).json({
                message: "Invalid subscription data",
                error: true,
                success: false
            });
        }

        // Check if user exists
        const user = await UserModel.findById(userId);
        if (!user) {
            console.error(`❌ User ${userId} not found`);
            return response.status(404).json({
                message: "User not found",
                error: true,
                success: false
            });
        }

        console.log(`💾 Saving subscription for user ${userId}...`);
        // Save or update subscription
        const subscription = await NotificationSubscriptionModel.findOneAndUpdate(
            { userId },
            {
                userId,
                endpoint,
                keys: {
                    p256dh: keys.p256dh,
                    auth: keys.auth
                }
            },
            { upsert: true, new: true }
        );

        console.log(`✅ Subscription saved successfully for user ${userId}`);

        return response.json({
            message: "Notification subscription saved successfully",
            error: false,
            success: true,
            data: subscription
        });

    } catch (error) {
        console.error("❌ Error saving subscription:", error);
        console.error("Error stack:", error.stack);
        return response.status(500).json({
            message: error.message || "Failed to save subscription",
            error: true,
            success: false
        });
    }
}

// Remove notification subscription
export async function removeSubscriptionController(request, response) {
    try {
        const userId = request.userId;

        const result = await NotificationSubscriptionModel.deleteOne({ userId });

        return response.json({
            message: "Notification subscription removed successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error("Error removing subscription:", error);
        return response.status(500).json({
            message: error.message || "Failed to remove subscription",
            error: true,
            success: false
        });
    }
}

// Send push notification to user
export async function sendPushNotification(userId, title, body, url = '/') {
    console.log(`\n📤 ===== SEND PUSH NOTIFICATION =====`);
    console.log(`User ID: ${userId}`);
    console.log(`Title: ${title}`);
    console.log(`Body: ${body}`);
    
    try {
        // Check if VAPID keys are configured
        if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
            console.warn("⚠️ VAPID keys not configured. Push notifications disabled.");
            console.log("💡 Add VAPID keys to server/.env file");
            return { success: false, error: "VAPID keys not configured" };
        }
        console.log("✅ VAPID keys found");

        // Find user's subscription
        console.log(`🔍 Looking for subscription for user ${userId}...`);
        const subscription = await NotificationSubscriptionModel.findOne({ userId });
        
        if (!subscription) {
            console.log(`❌ No subscription found for user ${userId}`);
            console.log(`💡 User needs to enable notifications first`);
            return { success: false, error: "User not subscribed" };
        }
        console.log(`✅ Subscription found:`, {
            endpoint: subscription.endpoint.substring(0, 50) + '...',
            hasKeys: !!(subscription.keys.p256dh && subscription.keys.auth)
        });

        // Prepare notification payload
        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: '/src/assets/preevent-new-logo.png',
            badge: '/src/assets/preevent-new-logo.png',
            tag: `order-${userId}-${Date.now()}` // Unique tag to prevent duplicate notifications
        });

        // Prepare push subscription object
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }
        };

        // Send notification
        console.log(`📨 Sending notification via webpush...`);
        await webpush.sendNotification(pushSubscription, payload);
        
        console.log(`✅ Push notification sent successfully!`);
        console.log(`========================================\n`);

        return { success: true };
    } catch (error) {
        console.error("❌ Error sending push notification:", error);
        console.error("Error details:", {
            message: error.message,
            statusCode: error.statusCode,
            body: error.body,
            endpoint: error.endpoint
        });
        
        // If subscription is invalid (410 Gone or 404 Not Found), remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`🗑️ Removing invalid subscription for user ${userId}`);
            await NotificationSubscriptionModel.deleteOne({ userId });
        }

        console.log(`========================================\n`);
        return { success: false, error: error.message };
    }
}
