// utils/notificationHelper.ts
import { Server } from "socket.io";
import { userSocketMap } from "../index.js";
import { NotificationType } from "../../generated/prisma/index.js";
import prisma from "../config/prismaConnect.js";

export const createAndSendNotification = async (
  io: Server,
  userId: number,
  title: string,
  message: string,
  type: NotificationType
) => {
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
    } else {
      console.log(`📭 User ${userId} is offline, notification saved to DB`);
    }

    return notification;
  } catch (error) {
    console.error("Auto-notification error:", error);
    return null;
  }
};

// ✅ Specific notification helpers for better code organization

export const notifyNewMessage = async (
  io: Server,
  receiverId: number,
  senderName: string,
  messagePreview: string
) => {
  const truncatedPreview = messagePreview.length > 50 
    ? `${messagePreview.substring(0, 50)}...` 
    : messagePreview;

  return createAndSendNotification(
    io,
    receiverId,
    "New Message",
    `${senderName}: ${truncatedPreview}`,
    "MESSAGE"
  );
};

export const notifyNewOrder = async (
  io: Server,
  sellerId: number,
  buyerName: string,
  productName: string,
  orderRef: string
) => {
  return createAndSendNotification(
    io,
    sellerId,
    "New Order Received",
    `${buyerName} ordered ${productName} (Order #${orderRef})`,
    "ORDER"
  );
};

export const notifyOrderStatusUpdate = async (
  io: Server,
  buyerId: number,
  status: string,
  orderRef: string
) => {
  return createAndSendNotification(
    io,
    buyerId,
    "Order Update",
    `Your order #${orderRef} is now ${status.toUpperCase()}`,
    "ORDER"
  );
};

export const notifyPromotion = async (
  io: Server,
  userId: number,
  promotionTitle: string,
  promotionMessage: string
) => {
  return createAndSendNotification(
    io,
    userId,
    promotionTitle,
    promotionMessage,
    "PROMOTION"
  );
};

export const notifySystemAlert = async (
  io: Server,
  userId: number,
  alertTitle: string,
  alertMessage: string
) => {
  return createAndSendNotification(
    io,
    userId,
    alertTitle,
    alertMessage,
    "SYSTEM"
  );
};

// ✅ Broadcast notification to multiple users
export const broadcastNotification = async (
  io: Server,
  userIds: number[],
  title: string,
  message: string,
  type: NotificationType
) => {
  try {
    const notifications = await Promise.all(
      userIds.map(userId => 
        createAndSendNotification(io, userId, title, message, type)
      )
    );

    console.log(`📣 Broadcast sent to ${userIds.length} users`);
    return notifications;
  } catch (error) {
    console.error("Broadcast notification error:", error);
    return null;
  }
};

export const notifySavedProduct = async (
  io: Server,
  ownerId: number,      // product owner
  saverName: string,    // person who saved the product
  productName: string
) => {
  return createAndSendNotification(
    io,
    ownerId,
    "Product Saved",
    `${saverName} saved your product "${productName}" ❤️`,
    "SAVE"
  );
};

// Notify when someone unsaves a product
export const notifyUnsavedProduct = async (
  io: any,
  ownerId: number,
  unsaverName: string,
  productName: string
) => {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: ownerId,
        title: "Product Unsaved",
        message: `${unsaverName} removed ${productName} from their saved list`,
        type: "SAVE",
        isRead: false,
      },
    });

    // Emit real-time notification via Socket.IO
    io.to(`user_${ownerId}`).emit("notification", {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      createdAt: notification.createdAt,
    });

    console.log(`Unsave notification sent to user ${ownerId}`);
  } catch (error) {
    console.error("Error sending unsave notification:", error);
  }
};

export const notifyUserFollow = async (
  io: Server,
  followedUserId: number, // the person being followed
  followerName: string
) => {
  return createAndSendNotification(
    io,
    followedUserId,
    "New Follower",
    `${followerName} just followed you 🎉`,
    "FOLLOW"
  );
};
