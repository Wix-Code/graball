import { Router } from "express";
import { sendMessage, getOrCreateConversation, getUserConversations, markMessagesAsRead, getMessages } from "../controllers/message.controller";
export default function messageRoutes(io) {
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
//# sourceMappingURL=message.route.js.map