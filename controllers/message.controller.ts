import { Request, Response } from "express";
import prisma from "@/config/prismaConnect";
import { Server } from "socket.io";
import { userSocketMap } from "..";
import { MessageStatus } from "@/generated/prisma";
import { createAndSendNotification } from "@/utils/notificationHelper";

export const sendMessage = (io: Server) => {
  return async (req: Request, res: Response) => {
    try {
      const { senderId, receiverId, content, conversationId } = req.body;

      if (!senderId || !receiverId || !content || !conversationId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const existingConversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (!existingConversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      // ✅ Use a transaction to update both message and conversation
      const result = await prisma.$transaction(async (tx) => {
        // Create message
        const message = await tx.message.create({
          data: {
            senderId,
            receiverId,
            conversationId,
            content,
          },
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            },
            receiver: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              }
            },
          }
        });

        // Update conversation's lastMessageAt
        await tx.conversation.update({
          where: { id: conversationId },
          data: { createdAt: new Date() }
        });

        return message;
      });

      // Emit real-time update to conversation room
      io.to(`conversation_${conversationId}`).emit("newMessage", result);

      // Also emit to specific user if they're online
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("messageNotification", {
          conversationId,
          senderId,
          preview: content.substring(0, 50)
        });
      }

      await createAndSendNotification(
        io,
        receiverId,
        "New Message",
        `You have a new message from ${result.sender.firstName || "Someone"}`,
        "MESSAGE"
      );

      res.status(201).json({ 
        status: true, 
        message: "Message sent successfully", 
        data: result 
      });
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};

// Get all messages in a conversation
export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.query;
    const { limit, offset } = req.query; // For pagination

    if (!conversationId) {
      return res.status(400).json({ error: "conversationId is required" });
    }

    // Optional pagination
    const take = limit ? Number(limit) : 50; // Default 50 messages
    const skip = offset ? Number(offset) : 0;

    const messages = await prisma.message.findMany({
      where: { 
        conversationId: Number(conversationId) 
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
        receiver: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          }
        },
      },
      orderBy: { 
        createdAt: "asc" // Oldest first (like WhatsApp)
      },
      take,
      skip,
    });

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: { conversationId: Number(conversationId) }
    });

    res.status(200).json({
      status: true,
      message: "Messages fetched successfully",
      data: {
        messages,
        pagination: {
          total: totalCount,
          limit: take,
          offset: skip,
          hasMore: skip + messages.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create or get existing conversation
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { buyerId, sellerId } = req.body;

    if (!buyerId || !sellerId) {
      return res.status(400).json({ error: "buyerId and sellerId are required" });
    }

    if (buyerId === sellerId) {
      return res.status(400).json({ error: "Cannot create conversation with yourself" });
    }

    // Try to find existing conversation (order doesn't matter)
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { buyerId, sellerId },
          { buyerId: sellerId, sellerId: buyerId }
        ]
      },
      include: {
        buyer: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        seller: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get last message
        }
      }
    });

    // Create if doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { buyerId, sellerId },
        include: {
          buyer: {
            select: { id: true, email: true, firstName: true, lastName: true }
          },
          seller: {
            select: { id: true, email: true, firstName: true, lastName: true }
          },
          messages: true
        }
      });
    }

    res.status(200).json({
      status: true,
      message: "Conversation retrieved successfully",
      data: conversation
    });
  } catch (error) {
    console.error("Get/Create conversation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all conversations for a user
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { buyerId: Number(userId) },
          { sellerId: Number(userId) }
        ]
      },
      include: {
        buyer: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        seller: {
          select: { id: true, email: true, firstName: true, lastName: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // Get last message for preview
        }
      },
      orderBy: {
        createdAt: 'desc' // Most recent first
      }
    });

    res.status(200).json({
      status: true,
      message: "Conversations retrieved successfully",
      data: conversations
    });
  } catch (error) {
    console.error("Get user conversations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req: Request, res: Response) => {
  try {
    const { conversationId, userId } = req.body;

    if (!conversationId || !userId) {
      return res.status(400).json({ error: "conversationId and userId are required" });
    }

    await prisma.message.updateMany({
      where: {
        conversationId: Number(conversationId),
        receiverId: Number(userId),
        status: { not: MessageStatus.READ }
      },
      data: {
        status: MessageStatus.READ
      }
    });

    res.status(200).json({
      status: true,
      message: "Messages marked as read"
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};