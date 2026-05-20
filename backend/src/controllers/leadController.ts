import { Response } from "express";
import { validationResult } from "express-validator";
import { Types } from "mongoose";
import Lead from "../models/Lead";
import { AuthRequest, LeadStatus, LeadSource } from "../types";
import { sendSuccess, sendError, sendPaginated } from "../utils/response";

// GET /api/leads  - Get all leads with filters, search, sort, pagination
export const getLeads = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {
      status,
      source,
      search,
      sort = "latest",
      page = "1",
    } = req.query as Record<string, string>;

    // Build MongoDB filter object dynamically
    const filter: Record<string, unknown> = {};

    // Role-based: sales users only see their own leads
    if (req.user?.role === "sales") {
      filter.createdBy = req.user.id;
    }

    // Filter by status
    if (status) {
      filter.status = status as LeadStatus;
    }

    // Filter by source
    if (source) {
      filter.source = source as LeadSource;
    }

    // Search by name OR email (case-insensitive)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Parse pagination values
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = 10; // Fixed: 10 records per page (as per requirement)
    const skip = (pageNum - 1) * limitNum;

    // Sort order: -1 = latest first, 1 = oldest first
    const sortOrder = sort === "oldest" ? 1 : -1;

    // Run query and count in parallel for performance
    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate("createdBy", "name email")
        .sort({ createdAt: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    sendPaginated(res, "Leads fetched successfully.", leads, total, pageNum, limitNum);
  } catch (error) {
    sendError(res, "Failed to fetch leads.", 500);
  }
};

// GET /api/leads/:id - Get single lead
export const getLeadById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!lead) {
      sendError(res, "Lead not found.", 404);
      return;
    }

    // Sales users can only view their own leads
    const creatorId = (lead.createdBy as { _id: Types.ObjectId })._id.toString();

    if (req.user?.role === "sales" && creatorId !== req.user.id) {
      sendError(res, "Access denied.", 403);
      return;
    }

    sendSuccess(res, "Lead fetched successfully.", lead);
  } catch (error) {
    sendError(res, "Failed to fetch lead.", 500);
  }
};

// POST /api/leads - Create new lead
export const createLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0].msg);
      return;
    }

    const { name, email, status, source } = req.body;

    const lead = await Lead.create({
      name,
      email,
      status: status || "New",
      source,
      createdBy: req.user?.id,
    });

    sendSuccess(res, "Lead created successfully.", lead, 201);
  } catch (error) {
    sendError(res, "Failed to create lead.", 500);
  }
};

// PUT /api/leads/:id - Update lead
export const updateLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendError(res, "Validation failed", 400, errors.array()[0].msg);
      return;
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      sendError(res, "Lead not found.", 404);
      return;
    }

    // Sales users can only update their own leads
    if (
      req.user?.role === "sales" &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, "Access denied.", 403);
      return;
    }

    // Prevent overwriting the creator field
    delete req.body.createdBy;

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    sendSuccess(res, "Lead updated successfully.", updatedLead);
  } catch (error) {
    sendError(res, "Failed to update lead.", 500);
  }
};

// DELETE /api/leads/:id - Delete lead
export const deleteLead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      sendError(res, "Lead not found.", 404);
      return;
    }

    // Sales users can only delete their own leads
    if (
      req.user?.role === "sales" &&
      lead.createdBy.toString() !== req.user.id
    ) {
      sendError(res, "Access denied.", 403);
      return;
    }

    await Lead.findByIdAndDelete(req.params.id);
    sendSuccess(res, "Lead deleted successfully.");
  } catch (error) {
    sendError(res, "Failed to delete lead.", 500);
  }
};

// GET /api/leads/export/csv - Export leads as CSV file
export const exportLeadsCSV = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const filter: Record<string, unknown> = {};

    // Sales users only export their own leads
    if (req.user?.role === "sales") {
      filter.createdBy = req.user.id;
    }

    const leads = await Lead.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });

    // Build CSV string manually (no extra library needed)
    const csvHeader = "Name,Email,Status,Source,Created By,Created At\n";
    const csvRows = leads
      .map((lead) => {
        const creator = lead.createdBy as unknown as { name: string };
        const date = new Date(lead.createdAt).toLocaleDateString("en-IN");
        return `"${lead.name}","${lead.email}","${lead.status}","${lead.source}","${creator?.name || "Unknown"}","${date}"`;
      })
      .join("\n");

    const csvContent = csvHeader + csvRows;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=leads-${Date.now()}.csv`
    );
    res.send(csvContent);
  } catch (error) {
    sendError(res, "Failed to export leads.", 500);
  }
};