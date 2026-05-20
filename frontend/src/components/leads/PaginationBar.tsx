import React from "react";
import { Pagination } from "../../types";
import Button from "../ui/Button";

interface PaginationBarProps {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

const PaginationBar: React.FC<PaginationBarProps> = ({ pagination, onPageChange }) => {
  const { page, totalPages, total, limit } = pagination;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
      {/* Showing X to Y of Z */}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Showing <span className="font-medium">{start}</span> to{" "}
        <span className="font-medium">{end}</span> of{" "}
        <span className="font-medium">{total}</span> leads
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          ← Prev
        </Button>

        {/* Show page numbers */}
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => Math.abs(p - page) <= 2) // Show nearby pages
          .map((p) => (
            <Button
              key={p}
              variant={p === page ? "primary" : "ghost"}
              size="sm"
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ))}

        <Button
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next →
        </Button>
      </div>
    </div>
  );
};

export default PaginationBar;
