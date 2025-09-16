import { Router } from "express";

export default function messageRoutes(io: any) {
  const router = Router();

  // define your routes here
  router.post("/", (req, res) => {
    const { message } = req.body;

    // do something with socket.io
    io.emit("newMessage", message);

    res.json({ success: true });
  });

  return router; // 👈 return router, not middleware
}
