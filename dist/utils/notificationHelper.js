// utils/notificationHelper.ts
import prisma from "@/config/prismaConnect";
import { userSocketMap } from "../index.js";
export const createAndSendNotification = async (io, userId, title, message, type) => {
    try {
        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    }
                }
            }
        });
        // Emit to user if online
        const socketId = userSocketMap.get(userId);
        if (socketId) {
            io.to(socketId).emit("notification", notification);
            console.log(`📨 Auto-notification sent to user ${userId}`);
        }
        else {
            console.log(`📭 User ${userId} is offline, notification saved to DB`);
        }
        return notification;
    }
    catch (error) {
        console.error("Auto-notification error:", error);
        return null;
    }
};
// ✅ Specific notification helpers for better code organization
export const notifyNewMessage = async (io, receiverId, senderName, messagePreview) => {
    const truncatedPreview = messagePreview.length > 50
        ? `${messagePreview.substring(0, 50)}...`
        : messagePreview;
    return createAndSendNotification(io, receiverId, "New Message", `${senderName}: ${truncatedPreview}`, "MESSAGE");
};
export const notifyNewOrder = async (io, sellerId, buyerName, productName, orderRef) => {
    return createAndSendNotification(io, sellerId, "New Order Received", `${buyerName} ordered ${productName} (Order #${orderRef})`, "ORDER");
};
export const notifyOrderStatusUpdate = async (io, buyerId, status, orderRef) => {
    return createAndSendNotification(io, buyerId, "Order Update", `Your order #${orderRef} is now ${status.toUpperCase()}`, "ORDER");
};
export const notifyPromotion = async (io, userId, promotionTitle, promotionMessage) => {
    return createAndSendNotification(io, userId, promotionTitle, promotionMessage, "PROMOTION");
};
export const notifySystemAlert = async (io, userId, alertTitle, alertMessage) => {
    return createAndSendNotification(io, userId, alertTitle, alertMessage, "SYSTEM");
};
// ✅ Broadcast notification to multiple users
export const broadcastNotification = async (io, userIds, title, message, type) => {
    try {
        const notifications = await Promise.all(userIds.map(userId => createAndSendNotification(io, userId, title, message, type)));
        console.log(`📣 Broadcast sent to ${userIds.length} users`);
        return notifications;
    }
    catch (error) {
        console.error("Broadcast notification error:", error);
        return null;
    }
};
export const notifyUserFollow = async (io, followedUserId, // the person being followed
followerName) => {
    return createAndSendNotification(io, followedUserId, "New Follower", `${followerName} just followed you 🎉`, "FOLLOW");
};
//# sourceMappingURL=notificationHelper.js.map