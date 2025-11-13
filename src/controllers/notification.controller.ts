import { Request, Response } from "express";
import prisma from "../config/prismaConnect";
import { Server } from "socket.io";
import { userSocketMap } from "../index.js";

// ✅ Use the same pattern as sendMessage - accept io as parameter
export const sendNotification = (io: Server) => {
  return async (req: Request, res: Response) => {
    try {
      const { userId, title, message, type } = req.body;

      if (!userId || !title || !message || !type) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate notification type
      const validTypes = ["SYSTEM", "MESSAGE", "PROMOTION", "ORDER"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({ 
          error: `Invalid notification type. Must be one of: ${validTypes.join(", ")}` 
        });
      }

      const notification = await prisma.notification.create({
        data: {
          userId: Number(userId),
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

      // ✅ Emit real-time notification if user is online
      const socketId = userSocketMap.get(Number(userId));
      if (socketId) {
        io.to(socketId).emit("notification", notification);
        console.log(`📨 Notification sent to user ${userId} via socket ${socketId}`);
      } else {
        console.log(`📭 User ${userId} is offline, notification saved to database`);
      }

      return res.status(201).json({
        status: true,
        message: "Notification sent successfully",
        data: notification,
      });
    } catch (error: any) {
      console.error("Send notification error:", error);
      return res.status(500).json({
        status: false,
        error: "Internal server error",
        details: error.message,
      });
    }
  };
};

// ✅ Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const notifications = await prisma.notification.findMany({
      where: {
        userId: Number(userId),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.status(200).json({
      status: true,
      message: "Notifications retrieved successfully",
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error: any) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      status: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// ✅ Mark notification as read
export const markNotificationAsRead = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: "notificationId is required" });
    }

    const notification = await prisma.notification.update({
      where: {
        id: Number(notificationId),
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      status: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error: any) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      status: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// ✅ Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await prisma.notification.updateMany({
      where: {
        userId: Number(userId),
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.status(200).json({
      status: true,
      message: "All notifications marked as read",
    });
  } catch (error: any) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      status: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// ✅ Delete a notification
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { notificationId } = req.params;

    if (!notificationId) {
      return res.status(400).json({ error: "notificationId is required" });
    }

    await prisma.notification.delete({
      where: {
        id: Number(notificationId),
      },
    });

    res.status(200).json({
      status: true,
      message: "Notification deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      status: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};

// ✅ Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const count = await prisma.notification.count({
      where: {
        userId: Number(userId),
        isRead: false,
      },
    });

    res.status(200).json({
      status: true,
      message: "Unread count retrieved successfully",
      data: { unreadCount: count },
    });
  } catch (error: any) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      status: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};