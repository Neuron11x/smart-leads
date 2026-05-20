import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
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

// Allow multiple origins: localhost for dev, production URL for prod
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

app.use(express.json()); // Parse JSON request bodies

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
// Start Server (only in non-serverless environments)
// ========================
// On Vercel, the app is exported as a handler — no need to call app.listen()
if (process.env.VERCEL !== "1") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
} else {
  // Vercel: connect DB on cold start, then export handler
  connectDB().catch(console.error);
}

export default app;