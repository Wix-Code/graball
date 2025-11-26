import { Server } from "socket.io";
import { addSaved, getSaved, removeAllSaved, unsaveProduct } from "../controllers/saved.controller.js";
import express from "express";
import { authenticateToken } from "@/middlewares/auth.middleware.js";

export default (io: Server) => {
  const router = express.Router();

  router.post("/add", authenticateToken, addSaved);
  router.get("/", authenticateToken, getSaved);
  router.post("/remove", authenticateToken, unsaveProduct);
  router.delete("/remove", authenticateToken, removeAllSaved);

  return router;
};