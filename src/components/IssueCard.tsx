"use client";

import { GitHubIssue } from "@/types/github";

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

function getStateColor(state: string, stateReason: string | null): string {
  if (state === "closed") {
    if (stateReason === "completed") {
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    }
    return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  }
  return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
}

export function IssueCard({ issue, onClick }: IssueCardProps) {
  return (
    <div
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white dark:bg-gray-800"
      onClick={() => onClick?.(issue)}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStateColor(
                issue.state,
                issue.state_reason
              )}`}
            >
              {issue.state}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              #{issue.number}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 truncate">
            {issue.title}
          </h3>
          {issue.body && (
            <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2 mb-3">
              {issue.body}
            </p>
          )}
          <div className="flex flex-wrap gap-2 mb-3">
            {issue.labels.map((label) => (
              <span
                key={label.id}
                className="px-2 py-0.5 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  border: `1px solid #${label.color}40`,
                }}
              >
                {label.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Created: {formatDate(issue.created_at)}</span>
            <span>Updated: {formatDate(issue.updated_at)}</span>
            {issue.comments > 0 && (
              <span className="flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
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
                  className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                />
              ))}
              {issue.assignees.length > 3 && (
                <span className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs font-medium border-2 border-white dark:border-gray-800">
                  +{issue.assignees.length - 3}
                </span>
              )}
            </div>
          )}
          {issue.milestone && (
            <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {issue.milestone.title}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
