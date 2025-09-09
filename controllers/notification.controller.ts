import { Request, Response } from "express";
import prisma from "@/config/prismaConnect";

export const sendNotification = async (req: Request, res: Response) => {
  try {
    const { userId, title, message, type } = req.body;

    // Validate required fields
    if (!userId || !title || !message || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,   // should match your enum NotificationType
      },
    });

    res.status(201).json({
      status: true,
      message: "Notification sent successfully",
      data: notification,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};