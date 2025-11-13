import { Router } from "express";
import { sendNotification, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, getUnreadCount, } from "@/controllers/notification.controller";
export default (io) => {
    const router = Router();
    // Send notification (with io for real-time)
    router.post("/", sendNotification(io));
    // Get all notifications for a user
    router.get("/user/:userId", getUserNotifications);
    // Get unread count
    router.get("/user/:userId/unread-count", getUnreadCount);
    // Mark single notification as read
    router.post("/:notificationId/read", markNotificationAsRead);
    // Mark all notifications as read for a user
    router.post("/user/:userId/read-all", markAllNotificationsAsRead);
    // Delete a notification
    router.delete("/:notificationId", deleteNotification);
    return router;
};
//# sourceMappingURL=notification.route.js.map