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

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Swagger documentation
swaggerSetup(app);

app.use("/api", routes);

const PORT = process.env.PORT || 4000;

connectDB(process.env.MONGODB_URI).catch(console.error);

// HTTP server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
  }
});

app.locals.io = io;

io.on("connection", (socket) => {
  socket.on("join", (room) => {
    if (typeof room === "string" && room.startsWith("product:")) socket.join(room);
  });
  socket.on("leave", (room) => {
    if (typeof room === "string") socket.leave(room);
  });
});

server.listen(PORT, () => console.log(`API on :${PORT}`));
