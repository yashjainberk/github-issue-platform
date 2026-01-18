"use client";

import { MessageSquare, CircleDot, CheckCircle2, Clock, User } from "lucide-react";
import { GitHubIssue } from "@/types/github";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface IssueCardProps {
  issue: GitHubIssue;
  onClick?: (issue: GitHubIssue) => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
}

function getStateStyles(state: string, stateReason: string | null) {
  if (state === "closed") {
    return {
      variant: "secondary" as const,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
      label: "Closed"
    };
  }
  return {
    variant: "default" as const,
    icon: <CircleDot className="w-3.5 h-3.5 text-primary" />,
    label: "Open"
  };
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
  const status = getStateStyles(issue.state, issue.state_reason);

  return (
    <Card
      className="group p-0 overflow-hidden hover:border-primary/50 transition-all duration-200 cursor-pointer bg-card shadow-sm hover:shadow-md"
      onClick={() => onClick?.(issue)}
    >
      <div className="flex">
        <div className={`w-1 ${issue.state === "open" ? "bg-primary" : "bg-emerald-500"} opacity-0 group-hover:opacity-100 transition-opacity`} />
        
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-muted-foreground text-xs font-medium">
                  #{issue.number}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  <Clock className="w-3 h-3" />
                  {formatRelativeTime(issue.updated_at)}
                </span>
              </div>
              
              <h3 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                {issue.title}
              </h3>
              
              {issue.body && (
                <p className="text-muted-foreground text-xs line-clamp-2 mb-3 leading-normal">
                  {issue.body}
                </p>
              )}
              
              <div className="flex flex-wrap items-center gap-2">
                {issue.labels.map((label) => (
                  <Badge
                    key={label.id}
                    variant="outline"
                    className="rounded-sm px-1.5 py-0 text-[10px] font-medium"
                    style={{
                      backgroundColor: `#${label.color}10`,
                      color: `#${label.color}`,
                      borderColor: `#${label.color}30`,
                    }}
                  >
                    {label.name}
                  </Badge>
                ))}
                
                <div className="flex items-center gap-3 text-xs text-muted-foreground ml-auto">
                  {issue.comments > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {issue.comments}
                    </span>
                  )}
                  {issue.assignees.length > 0 && (
                    <div className="flex -space-x-1 ml-1">
                      {issue.assignees.slice(0, 3).map((assignee) => (
                        <img
                          key={assignee.id}
                          src={assignee.avatar_url}
                          alt={assignee.login}
                          className="w-4 h-4 rounded-full border border-background"
                          title={assignee.login}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="shrink-0 pt-0.5">
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              >
                {status.icon}
                {status.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
