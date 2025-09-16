import express from 'express';
import dotenv from 'dotenv';
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from './routes/auth.route.js';
import productRoutes from './routes/product.route.js';
import storeRoutes from './routes/store.route.js';
import categoryRoutes from './routes/category.route.js';
import messageRoutes from './routes/message.route.js';
import notificationRoutes from './routes/notification.route.js';

dotenv.config();

const app = express();
const httpServer = createServer(app); // use httpServer instead of app.listen
const io = new Server(httpServer, {
  cors: {
    origin: "*", // set to your frontend URL in production
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/messages', messageRoutes(io)); // pass io into routes
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log("⚡ User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});