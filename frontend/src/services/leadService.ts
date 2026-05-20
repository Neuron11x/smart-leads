import api from "./api";
import { Lead, LeadFilters, LeadFormData, PaginatedResponse, ApiResponse } from "../types";

// Get all leads with filters
export const getLeads = async (
  filters: Partial<LeadFilters>
): Promise<PaginatedResponse<Lead>> => {
  // Remove empty string values so they don't get sent as query params
  const params = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== "" && v !== undefined)
  );
  const { data } = await api.get<PaginatedResponse<Lead>>("/leads", { params });
  return data;
};

// Get single lead
export const getLeadById = async (id: string): Promise<Lead> => {
  const { data } = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
  return data.data!;
};

// Create new lead
export const createLead = async (leadData: LeadFormData): Promise<Lead> => {
  const { data } = await api.post<ApiResponse<Lead>>("/leads", leadData);
  return data.data!;
};

// Update lead
export const updateLead = async (
  id: string,
  leadData: Partial<LeadFormData>
): Promise<Lead> => {
  const { data } = await api.put<ApiResponse<Lead>>(`/leads/${id}`, leadData);
  return data.data!;
};

// Delete lead
export const deleteLead = async (id: string): Promise<void> => {
  await api.delete(`/leads/${id}`);
};

// Download CSV export
export const exportLeadsCSV = async (): Promise<void> => {
  const response = await api.get("/leads/export/csv", {
    responseType: "blob", // Important: get binary data
  });

  // Create download link programmatically
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `leads-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
