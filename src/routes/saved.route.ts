import { Server } from "socket.io";
import { addSaved, getSaved } from "../controllers/saved.controller.js";
import express from "express";

export default (io: Server) => {
  const router = express.Router();

  router.post("/add", addSaved);
  router.get("/", getSaved);

  return router;
};