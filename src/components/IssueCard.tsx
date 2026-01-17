"use client";

import { MessageSquare } from "lucide-react";
import { GitHubIssue } from "@/types/github";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IssueCardProps {
  issue: GitHubIssue;
  onClick?: (issue: GitHubIssue) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStateBadgeVariant(state: string, stateReason: string | null): "success" | "purple" | "secondary" {
  if (state === "closed") {
    if (stateReason === "completed") {
      return "purple";
    }
    return "secondary";
  }
  return "success";
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
  return (
    <Card
      className="p-4 hover:shadow-md transition-shadow cursor-pointer bg-card"
      onClick={() => onClick?.(issue)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={getStateBadgeVariant(issue.state, issue.state_reason)}>
              {issue.state}
            </Badge>
            <span className="text-muted-foreground text-sm">
              #{issue.number}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2 truncate">
            {issue.title}
          </h3>
          {issue.body && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {issue.body}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {issue.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="rounded-full"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  borderColor: `#${label.color}40`,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Created: {formatDate(issue.created_at)}</span>
            <span>Updated: {formatDate(issue.updated_at)}</span>
            {issue.comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-4 h-4" />
                {issue.comments}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {issue.assignees.length > 0 && (
            <div className="flex -space-x-2">
              {issue.assignees.slice(0, 3).map((assignee) => (
                <img
                  key={assignee.id}
                  src={assignee.avatar_url}
                  alt={assignee.login}
                  title={assignee.login}
                  className="w-8 h-8 rounded-full border-2 border-background"
                />
              ))}
              {issue.assignees.length > 3 && (
                <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                  +{issue.assignees.length - 3}
                </span>
              )}
            </div>
          )}
          {issue.milestone && (
            <Badge variant="secondary" className="text-xs">
              {issue.milestone.title}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
