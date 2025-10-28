import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { connectDB } from "./config/db.js";

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use("/", routes);

const PORT = process.env.PORT || 4000;

// ✅ Biến môi trường giờ đã được load chính xác
connectDB(process.env.MONGODB_URI).catch(console.error);

app.listen(PORT, () => console.log(`API on :${PORT}`));
