import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) { 
    console.warn("Missing MONGODB_URI (Atlas). /health vẫn chạy, DB = SKIPPED"); 
    return; 
  }
  await mongoose.connect(uri, { autoIndex: true, serverSelectionTimeoutMS: 10000 });
  await mongoose.connection.db.admin().ping();
  console.log("MongoDB Atlas connected & ping OK");
}