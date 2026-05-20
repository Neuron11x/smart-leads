import React from "react";
import { LeadStatus } from "../../types";

interface BadgeProps {
  status: LeadStatus;
}

const statusStyles: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Contacted: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  Qualified: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Lost: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const Badge: React.FC<BadgeProps> = ({ status }) => {
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

export default Badge;
