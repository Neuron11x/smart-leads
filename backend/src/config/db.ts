import mongoose from "mongoose";

// Track connection state to avoid reconnecting on every request (Vercel serverless)
let isConnected = false;

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    const db = await mongoose.connect(mongoUri);
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    // Do NOT call process.exit(1) on Vercel — it kills the serverless function
    throw error;
  }
};

export default connectDB;
