import { Request, Response } from "express";
import prisma from "@/config/prismaConnect";
import { Server } from "socket.io";

export const sendMessage = (io: Server) => {
  return async (req: Request, res: Response) => {
    try {
      const { senderId, receiverId, content, conversationId } = req.body;

      if (!senderId || !receiverId || !content || !conversationId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Save to DB
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          conversationId,
          content,
        },
        include: {
          sender: true,
          receiver: true,
        }
      });

      // Emit real-time update to conversation room
      io.to(`conversation_${conversationId}`).emit("newMessage", message);

      res
        .status(201)
        .json({ status: true, message: "Message sent successfully", data: message });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: Number(conversationId) },
      orderBy: { createdAt: "asc" },
      include: {
        sender: true,
        receiver: true,
      },
    });

    res.status(200).json({
      status: true,
      message: "Messages fetched successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};