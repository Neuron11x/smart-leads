import React from "react";
import { Lead } from "../../types";
import { useAuthStore } from "../../store/authStore";
import Badge from "../ui/Badge";
import Button from "../ui/Button";

interface LeadTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (lead: Lead) => void;
  onView: (lead: Lead) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({ leads, onEdit, onDelete, onView }) => {
  const { user } = useAuthStore();

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Source</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Created</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-400">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
          {leads.map((lead) => (
            <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {lead.name}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {lead.email}
              </td>
              <td className="px-4 py-3">
                <Badge status={lead.status} />
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                {lead.source}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-gray-500 whitespace-nowrap">
                {new Date(lead.createdAt).toLocaleDateString("en-IN")}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onView(lead)}>
                    View
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onEdit(lead)}>
                    Edit
                  </Button>
                  {/* Admin can delete any, sales can delete their own */}
                  {(user?.role === "admin" ||
                    lead.createdBy?.email === user?.email) && (
                    <Button variant="danger" size="sm" onClick={() => onDelete(lead)}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;
