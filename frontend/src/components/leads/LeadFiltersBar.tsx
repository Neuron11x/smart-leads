import React from "react";
import { LeadFilters } from "../../types";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Button from "../ui/Button";

interface LeadFiltersBarProps {
  filters: LeadFilters;
  onFilterChange: (filters: Partial<LeadFilters>) => void;
  onExport: () => void;
  isExporting: boolean;
}

const statusOptions = [
  { value: "New", label: "New" },
  { value: "Contacted", label: "Contacted" },
  { value: "Qualified", label: "Qualified" },
  { value: "Lost", label: "Lost" },
];

const sourceOptions = [
  { value: "Website", label: "Website" },
  { value: "Instagram", label: "Instagram" },
  { value: "Referral", label: "Referral" },
];

const sortOptions = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
];

const LeadFiltersBar: React.FC<LeadFiltersBarProps> = ({
  filters,
  onFilterChange,
  onExport,
  isExporting,
}) => {
  const handleReset = () => {
    onFilterChange({ status: "", source: "", search: "", sort: "latest", page: 1 });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        {/* Search input */}
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ search: e.target.value, page: 1 })
            }
          />
        </div>

        {/* Status filter */}
        <div className="min-w-[140px]">
          <Select
            options={statusOptions}
            placeholder="All Statuses"
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
          />
        </div>

        {/* Source filter */}
        <div className="min-w-[140px]">
          <Select
            options={sourceOptions}
            placeholder="All Sources"
            value={filters.source}
            onChange={(e) => onFilterChange({ source: e.target.value, page: 1 })}
          />
        </div>

        {/* Sort */}
        <div className="min-w-[140px]">
          <Select
            options={sortOptions}
            value={filters.sort}
            onChange={(e) =>
              onFilterChange({ sort: e.target.value as "latest" | "oldest", page: 1 })
            }
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button variant="ghost" size="md" onClick={handleReset}>
            Reset
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={onExport}
            isLoading={isExporting}
          >
            📥 Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LeadFiltersBar;
