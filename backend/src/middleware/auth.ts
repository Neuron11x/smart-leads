import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest, UserRole } from "../types";
import { sendError } from "../utils/response";

// JWT payload shape
interface JwtPayload {
  id: string;
  role: UserRole;
}

// Verify JWT token and attach user to request
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from Authorization header: "Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Access denied. No token provided.", 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET as string;

    // Verify the token
    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Attach user info to request object
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch {
    sendError(res, "Invalid or expired token.", 401);
  }
};

// Only allow admin role
export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== "admin") {
    sendError(res, "Access denied. Admins only.", 403);
    return;
  }
  next();
};
