import mongoose from "mongoose";

export async function connectDB(url: string): Promise<typeof mongoose.connection> {
  if (!url) {
    throw new Error("MongoDB URI is required");
  }

  try {
    await mongoose.connect(url);
    console.log("MongoDB connected successfully");
    return mongoose.connection  
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}