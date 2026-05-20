import React, { useState, useEffect, useCallback } from "react";
import { getLeads, deleteLead, exportLeadsCSV } from "../services/leadService";
import { Lead, LeadFilters, Pagination } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import { useAuthStore } from "../store/authStore";
import Navbar from "../components/layout/Navbar";
import LeadFiltersBar from "../components/leads/LeadFiltersBar";
import LeadTable from "../components/leads/LeadTable";
import PaginationBar from "../components/leads/PaginationBar";
import LeadForm from "../components/leads/LeadForm";
import Modal from "../components/ui/Modal";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [viewLead, setViewLead] = useState<Lead | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Lead | null>(null);

  // Filters
  const [filters, setFilters] = useState<LeadFilters>({
    status: "",
    source: "",
    search: "",
    sort: "latest",
    page: 1,
  });

  // Debounce search so API doesn't call on every keystroke
  const debouncedSearch = useDebounce(filters.search, 500);

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getLeads({
        ...filters,
        search: debouncedSearch, // Use debounced search
      });
      setLeads(response.data);
      setPagination(response.pagination);
    } catch {
      setError("Failed to load leads. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [filters, debouncedSearch]);

  // Reset to page 1 whenever debounced search changes
  useEffect(() => {
    setFilters((prev) => ({ ...prev, page: 1 }));
  }, [debouncedSearch]);

  // Refetch when filters change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (newFilters: Partial<LeadFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteLead(deleteConfirm._id);
      toast.success("Lead deleted successfully!");
      setDeleteConfirm(null);
      fetchLeads(); // Refresh list
    } catch {
      toast.error("Failed to delete lead.");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportLeadsCSV();
      toast.success("CSV downloaded!");
    } catch {
      toast.error("Export failed. Try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormSuccess = () => {
    setIsCreateOpen(false);
    setEditLead(null);
    fetchLeads(); // Refresh after create/edit
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leads Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {pagination ? `${pagination.total} total leads` : "Loading..."}
            </p>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="md">
            + Add New Lead
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-4">
          <LeadFiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onExport={handleExport}
            isExporting={isExporting}
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <Spinner text="Loading leads..." />
        ) : error ? (
          // Error state
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-4xl mb-3">⚠️</p>
            <p className="text-red-500 font-medium">{error}</p>
            <Button variant="secondary" className="mt-4" onClick={fetchLeads}>
              Try Again
            </Button>
          </div>
        ) : leads.length === 0 ? (
          // Empty state
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-5xl mb-4">📭</p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No leads found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filters.search || filters.status || filters.source
                ? "Try adjusting your filters"
                : "Start by adding your first lead!"}
            </p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              Add Lead
            </Button>
          </div>
        ) : (
          <>
            <LeadTable
              leads={leads}
              onEdit={(lead) => setEditLead(lead)}
              onDelete={(lead) => setDeleteConfirm(lead)}
              onView={(lead) => setViewLead(lead)}
            />
            {pagination && (
              <PaginationBar
                pagination={pagination}
                onPageChange={(page) => handleFilterChange({ page })}
              />
            )}
          </>
        )}
      </main>

      {/* Create Lead Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Lead"
      >
        <LeadForm
          onSuccess={handleFormSuccess}
          onCancel={() => setIsCreateOpen(false)}
        />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={!!editLead}
        onClose={() => setEditLead(null)}
        title="Edit Lead"
      >
        {editLead && (
          <LeadForm
            existingLead={editLead}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditLead(null)}
          />
        )}
      </Modal>

      {/* View Lead Details Modal */}
      <Modal
        isOpen={!!viewLead}
        onClose={() => setViewLead(null)}
        title="Lead Details"
      >
        {viewLead && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-lg">
                {viewLead.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{viewLead.name}</p>
                <p className="text-sm text-gray-500">{viewLead.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                <div className="mt-1"><Badge status={viewLead.status} /></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Source</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{viewLead.source}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Created By</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {viewLead.createdBy?.name || "Unknown"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Created At</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                  {new Date(viewLead.createdAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
            {user?.role === "admin" && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-400">Role: Admin</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Confirm Delete"
      >
        {deleteConfirm && (
          <div className="flex flex-col gap-4">
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete{" "}
              <strong className="text-gray-900 dark:text-white">{deleteConfirm.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="danger" className="flex-1" onClick={handleDelete}>
                Yes, Delete
              </Button>
              <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DashboardPage;
