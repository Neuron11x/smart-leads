import { Request, Response, NextFunction } from "express";
import { sendError } from "../utils/response";

// Global error handler - catches all unhandled errors
// Must have 4 parameters for Express to recognize it as error handler
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error("❌ Unhandled Error:", err.message);
  sendError(res, "Something went wrong on the server.", 500, err.message);
};

// Handle routes that don't exist
export const notFound = (req: Request, res: Response): void => {
  sendError(res, `Route ${req.originalUrl} not found.`, 404);
};
