import mongoose, { Schema, Document } from "mongoose";
import { ILead, LeadStatus, LeadSource } from "../types";

export interface ILeadDocument extends ILead, Document {}

const LeadSchema = new Schema<ILeadDocument>(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Lead email is required"],
      lowercase: true,
      trim: true,
      index: true, // Index for faster search queries
    },
    status: {
      type: String,
      enum: ["New", "Contacted", "Qualified", "Lost"] as LeadStatus[],
      default: "New",
    },
    source: {
      type: String,
      enum: ["Website", "Instagram", "Referral"] as LeadSource[],
      required: [true, "Lead source is required"],
    },
    createdBy: {
      // Which user created this lead
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Compound index for common filter queries (status + source + createdAt)
LeadSchema.index({ status: 1, source: 1, createdAt: -1 });
LeadSchema.index({ createdBy: 1, createdAt: -1 });

const Lead = mongoose.model<ILeadDocument>("Lead", LeadSchema);
export default Lead;
