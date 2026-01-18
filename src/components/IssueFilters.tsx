"use client";

import { IssueFilters } from "@/types/github";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Filter, SortAsc, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IssueFiltersProps {
  filters: IssueFilters;
  onFiltersChange: (filters: IssueFilters) => void;
}

export function IssueFiltersComponent({
  filters,
  onFiltersChange,
}: IssueFiltersProps) {
  return (
    <Card className="p-0 border overflow-hidden bg-card">
      <div className="flex flex-col md:flex-row md:items-center divide-y md:divide-y-0 md:divide-x">
        {/* State Filter */}
        <div className="flex items-center gap-2 px-3 py-2 shrink-0 bg-muted/30">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <Select
            value={filters.state}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                state: value as IssueFilters["state"],
              })
            }
          >
            <SelectTrigger className="border-none shadow-none focus:ring-0 h-6 p-0 bg-transparent text-xs font-medium w-[100px]">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Issues</SelectItem>
              <SelectItem value="open">Open Only</SelectItem>
              <SelectItem value="closed">Closed Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2 px-3 py-2 shrink-0">
          <SortAsc className="w-3.5 h-3.5 text-muted-foreground" />
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sort: value as IssueFilters["sort"],
              })
            }
          >
            <SelectTrigger className="border-none shadow-none focus:ring-0 h-6 p-0 bg-transparent text-xs font-medium w-[100px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Search */}
        <div className="flex items-center gap-2 px-3 py-2 flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <Input
            type="text"
            value={filters.assignee || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                assignee: e.target.value || null,
              })
            }
            placeholder="Search assignee..."
            className="border-none shadow-none focus-visible:ring-0 h-6 p-0 bg-transparent text-xs placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </Card>
  );
}
