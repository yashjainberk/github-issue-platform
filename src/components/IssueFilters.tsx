"use client";

import { IssueFilters } from "@/types/github";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
    <Card className="p-4 mb-6 bg-muted/50">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="state-filter">State</Label>
          <Select
            value={filters.state}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                state: value as IssueFilters["state"],
              })
            }
          >
            <SelectTrigger id="state-filter" className="w-[140px] bg-background">
              <SelectValue placeholder="Select state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="sort-filter">Sort By</Label>
          <Select
            value={filters.sort}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                sort: value as IssueFilters["sort"],
              })
            }
          >
            <SelectTrigger id="sort-filter" className="w-[140px] bg-background">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="updated">Updated</SelectItem>
              <SelectItem value="comments">Comments</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="direction-filter">Direction</Label>
          <Select
            value={filters.direction}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                direction: value as IssueFilters["direction"],
              })
            }
          >
            <SelectTrigger id="direction-filter" className="w-[150px] bg-background">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Newest First</SelectItem>
              <SelectItem value="asc">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="assignee-filter">Assignee</Label>
          <Input
            id="assignee-filter"
            type="text"
            value={filters.assignee || ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                assignee: e.target.value || null,
              })
            }
            placeholder="Filter by assignee"
            className="w-[180px] bg-background"
          />
        </div>
      </div>
    </Card>
  );
}
