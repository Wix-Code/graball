import { Request, Response } from "express";
import prisma from "@/config/prismaConnect";
import { io, userSocketMap } from "../index.js";

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!userId || !title || !message || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const notification = await prisma.notification.create({
      data: {
        userId: Number(userId),
        title,
        message,
        type,
      },
    });

    // ✅ Emit real-time notification if user is online
    const socketId = userSocketMap.get(Number(userId));
    if (socketId) {
      io.to(socketId).emit("notification", notification);
      console.log(`📨 Notification sent to user ${userId}`);
    }

    return res.status(201).json({
      status: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (error: any) {
    console.error("Send notification error:", error);
    res.status(500).json({
      status: false,
      error: "Internal server error",
      details: error.message,
    });
  }
};