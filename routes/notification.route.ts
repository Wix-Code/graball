import { Router } from "express";
import { sendMessage, getMessages } from "@/controllers/message.controller";
import { Server } from "socket.io";

export default (io: Server) => {
  const router = Router();

  router.post("/", sendMessage(io)); // now works ✅
  router.get("/", getMessages);

  return router;
};