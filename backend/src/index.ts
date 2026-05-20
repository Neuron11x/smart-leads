import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose"; // Handle connection status check ke liye
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import leadRoutes from "./routes/leadRoutes";
import { errorHandler, notFound } from "./middleware/errorHandler";

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ========================
// Rate Limiting
// ========================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 auth attempts per 15 min per IP
  message: { success: false, message: "Too many requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Max 200 API calls per 15 min
  standardHeaders: true,
  legacyHeaders: false,
});

// ========================
// Middleware Setup
// ========================

app.use(
  cors({
    origin: '*', // Vercel and production flexible cross-origin sharing
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Preflight (OPTIONS) requests handler
app.options('*', cors());

app.use(express.json()); // Parse JSON request bodies

// Serverless DB Connection Ensuring Middleware
app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (error) {
      console.error("Database connection failed inside serverless invocation:", error);
    }
  }
  next();
});

// ========================
// Routes
// ========================
app.get("/", (_req, res) => {
  res.json({ message: "Smart Leads API is running! 🚀" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/leads", apiLimiter, leadRoutes);

// ========================
// Error Handlers (must be last)
// ========================
app.use(notFound);
app.use(errorHandler);

// ========================
// Start Server / Cold Starts
// ========================
if (process.env.VERCEL !== "1") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // Cold start connection setup for Serverless architecture
  connectDB().catch(console.error);
}

export default app;