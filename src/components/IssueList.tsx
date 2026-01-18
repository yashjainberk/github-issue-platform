"use client";

import { AlertCircle, ClipboardList } from "lucide-react";
import { GitHubIssue } from "@/types/github";
import { IssueCard } from "./IssueCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface IssueListProps {
  issues: GitHubIssue[];
  loading: boolean;
  error: string | null;
  onIssueClick?: (issue: GitHubIssue) => void;
}

function IssueCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

export function IssueList({
  issues,
  loading,
  error,
  onIssueClick,
}: IssueListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <IssueCardSkeleton />
        <IssueCardSkeleton />
        <IssueCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Issues</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900 border-dashed border-2 border-gray-100 dark:border-gray-800">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-full mb-4">
          <ClipboardList className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          No issues found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[280px] text-center">
          We couldn't find any issues matching your current filters. Try adjusting them or search for something else.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} onClick={onIssueClick} />
      ))}
    </div>
  );
}
