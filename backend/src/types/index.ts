// ==============================
// All shared TypeScript types
// ==============================

import { Request } from "express";
import { Types } from "mongoose";

// --- User Types ---
export type UserRole = "admin" | "sales";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: Date;
}

// --- Lead Types ---
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
export type LeadSource = "Website" | "Instagram" | "Referral";

export interface ILead {
  _id: Types.ObjectId;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// --- Request Types (extend Express Request to include user) ---
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

// --- API Response Types ---
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: {
    total: number;       // total matching records
    page: number;        // current page
    limit: number;       // records per page
    totalPages: number;  // total pages
  };
}

// --- Query Filter Types ---
export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  search?: string;
  sort?: "latest" | "oldest";
  page?: number;
  limit?: number;
}
