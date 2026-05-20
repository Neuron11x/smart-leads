import { Response } from "express";
import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { AuthRequest } from "../types";
import { sendSuccess, sendError } from "../utils/response";

// Generate JWT token
const generateToken = (id: string, role: string): string => {
  const expiresIn = (process.env.JWT_EXPIRES_IN || "7d") as `${number}${"s" | "m" | "h" | "d" | "w" | "y"}` | `${number}`;
  return jwt.sign({ id, role }, process.env.JWT_SECRET as string, {
    expiresIn,
  });
};

// POST /api/auth/register
export const register = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0].msg);
      return;
    }

    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendError(res, "User with this email already exists.", 400);
      return;
    }

    // Create new user (password hashing happens in model via pre-save hook)
    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id.toString(), user.role);

    sendSuccess(
      res,
      "Registration successful!",
      {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      201
    );
  } catch (error) {
    sendError(res, "Registration failed. Please try again.", 500);
  }
};

// POST /api/auth/login
export const login = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0].msg);
      return;
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      sendError(res, "Invalid email or password.", 401);
      return;
    }

    // Compare password with hashed password in DB
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      sendError(res, "Invalid email or password.", 401);
      return;
    }

    const token = generateToken(user._id.toString(), user.role);

    sendSuccess(res, "Login successful!", {
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    sendError(res, "Login failed. Please try again.", 500);
  }
};

// GET /api/auth/me  (get currently logged in user)
export const getMe = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user?.id).select("-password");
    if (!user) {
      sendError(res, "User not found.", 404);
      return;
    }
    sendSuccess(res, "User fetched successfully.", user);
  } catch (error) {
    sendError(res, "Failed to get user.", 500);
  }
};
