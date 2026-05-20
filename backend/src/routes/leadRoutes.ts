import { Router } from "express";
import { body } from "express-validator";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportLeadsCSV,
} from "../controllers/leadController";
import { protect, adminOnly } from "../middleware/auth";

const router = Router();

// All lead routes require login
router.use(protect);

// Validation for creating a lead
const createLeadValidation = [
  body("name").trim().notEmpty().withMessage("Lead name is required"),
  body("email").trim().isEmail().withMessage("Please enter a valid email"),
  body("source")
    .isIn(["Website", "Instagram", "Referral"])
    .withMessage("Source must be Website, Instagram, or Referral"),
  body("status")
    .optional()
    .isIn(["New", "Contacted", "Qualified", "Lost"])
    .withMessage("Invalid status value"),
];

// Validation for updating (all fields optional)
const updateLeadValidation = [
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  body("email").optional().isEmail().withMessage("Please enter a valid email"),
  body("source")
    .optional()
    .isIn(["Website", "Instagram", "Referral"])
    .withMessage("Invalid source value"),
  body("status")
    .optional()
    .isIn(["New", "Contacted", "Qualified", "Lost"])
    .withMessage("Invalid status value"),
];

// Routes
router.get("/export/csv", exportLeadsCSV);       // Export CSV
router.get("/", getLeads);                         // Get all with filters
router.get("/:id", getLeadById);                   // Get single lead
router.post("/", createLeadValidation, createLead); // Create lead
router.put("/:id", updateLeadValidation, updateLead); // Update lead
router.delete("/:id", deleteLead);                 // Delete (admin can delete any, sales own only)

export default router;
