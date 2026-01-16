"use client";

import { IssueFilters } from "@/types/github";

interface IssueFiltersProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
}

export function IssueFiltersComponent({
  filters,
  onFiltersChange,
}: IssueFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg mb-6">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          State
        </label>
        <select
          value={filters.state}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              state: e.target.value as IssueFilters["state"],
            })
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sort By
        </label>
        <select
          value={filters.sort}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              sort: e.target.value as IssueFilters["sort"],
            })
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="created">Created</option>
          <option value="updated">Updated</option>
          <option value="comments">Comments</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Direction
        </label>
        <select
          value={filters.direction}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              direction: e.target.value as IssueFilters["direction"],
            })
          }
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Assignee
        </label>
        <input
          type="text"
          value={filters.assignee || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              assignee: e.target.value || null,
            })
          }
          placeholder="Filter by assignee"
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
