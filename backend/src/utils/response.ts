import { Response } from "express";
import { ApiResponse, PaginatedResponse } from "../types";

// Send success response - clean and consistent format
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(response);
};

// Send error response
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  error?: string
): void => {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
};

// Send paginated response for list APIs
export const sendPaginated = <T>(
  res: Response,
  message: string,
  data: T[],
  total: number,
  page: number,
  limit: number
): void => {
  const response: PaginatedResponse<T> = {
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
  res.status(200).json(response);
};
