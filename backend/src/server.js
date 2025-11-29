import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import { swaggerSetup } from "./config/swagger.js";

const app = express();

/* ⛔ FIX CORS 100% WORK */
app.use(cors({
  origin: ["http://localhost", "http://localhost:5173"], // Chấp nhận cả 2
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());

// Swagger
swaggerSetup(app);

// API Routes
app.use("/api", routes);

const PORT = process.env.PORT || 4000;

// Connect MongoDB
connectDB(process.env.MONGODB_URI).catch(console.error);

// HTTP + Socket.IO
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost", "http://localhost:5173"],
    credentials: true
  }
});

app.locals.io = io;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join", (room) => {
    if (typeof room === "string" && room.startsWith("product:"))
      socket.join(room);
  });

  socket.on("leave", (room) => {
    if (typeof room === "string") socket.leave(room);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

server.listen(PORT, () => console.log("🚀 API Running on Port:", PORT));
