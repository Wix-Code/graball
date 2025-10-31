// utils/notificationHelper.ts
import prisma from "@/config/prismaConnect";
import { Server } from "socket.io";
import { userSocketMap } from "../index.js";
import { NotificationType } from "@/generated/prisma/index.js";


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
    });

    // Emit to user if online
    const socketId = userSocketMap.get(userId);
    if (socketId) {
      io.to(socketId).emit("notification", notification);
      console.log(`📨 Auto-notification sent to user ${userId}`);
    }

    return notification;
  } catch (error) {
    console.error("Auto-notification error:", error);
    return null;
  }
};