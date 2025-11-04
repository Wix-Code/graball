import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import storeRoutes from "./routes/store.route.js";
import categoryRoutes from "./routes/category.route.js";
import messageRoutes from "./routes/message.route.js";
import notificationRoutes from "./routes/notification.route.js";
import followRoutes from "./routes/follow.route.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// ✅ Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "*", // replace with your frontend URL in production
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/messages", messageRoutes(io)); // pass io into routes
app.use("/api/notifications", notificationRoutes(io));
app.use("/api/follow", followRoutes(io));

app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


// ✅ Socket Handling
const userSocketMap = new Map<number, string>(); // userId → socketId

io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("register", (userId: number) => {
    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`👤 User ${userId} registered with socket ${socket.id}`);
    }
  });

  socket.on("join-conversation", (conversationId: number) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`👥 Socket ${socket.id} joined conversation_${conversationId}`);
  });

  socket.on("leave-conversation", (conversationId: number) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`👋 Socket ${socket.id} left conversation_${conversationId}`);
  });

  // ✅ Handle typing indicator
  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit("userTyping", { userId });
  });

  socket.on("stop-typing", ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit("userStoppedTyping", { userId });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    for (const [userId, sockId] of userSocketMap.entries()) {
      if (sockId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

// ✅ Export io and userSocketMap so controllers can emit notifications
export { io, userSocketMap };