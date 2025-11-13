import { Router } from "express";
import { 
  sendMessage, 
  getOrCreateConversation,
  getUserConversations,
  markMessagesAsRead,
  getMessages
} from "../controllers/message.controller.js";
import { Server } from "socket.io";

export default function messageRoutes(io: Server) {
  const router = Router();

  // Message routes
  router.post("/", sendMessage(io));
  router.get("/", getMessages);
  router.put("/read", markMessagesAsRead);

  // Conversation routes
  router.post("/conversations", getOrCreateConversation);
  router.get("/conversations/:userId", getUserConversations);

  return router;
}