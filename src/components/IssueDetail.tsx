"use client";

import { GitHubIssue } from "@/types/github";

interface IssueDetailProps {
  issue: GitHubIssue;
  onClose: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function IssueDetail({ issue, onClose }: IssueDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                issue.state === "open"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              }`}
            >
              {issue.state}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              #{issue.number}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {issue.title}
          </h2>

          <div className="flex flex-wrap gap-2 mb-6">
            {issue.labels.map((label) => (
              <span
                key={label.id}
                className="px-3 py-1 text-sm font-medium rounded-full"
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

          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Author</p>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={issue.user.avatar_url}
                  alt={issue.user.login}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-gray-900 dark:text-white font-medium">
                  {issue.user.login}
                </span>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Assignees
              </p>
              <div className="flex items-center gap-2 mt-1">
                {issue.assignees.length > 0 ? (
                  issue.assignees.map((assignee) => (
                    <img
                      key={assignee.id}
                      src={assignee.avatar_url}
                      alt={assignee.login}
                      title={assignee.login}
                      className="w-6 h-6 rounded-full"
                    />
                  ))
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    Unassigned
                  </span>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Created
              </p>
              <p className="text-gray-900 dark:text-white mt-1">
                {formatDate(issue.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Updated
              </p>
              <p className="text-gray-900 dark:text-white mt-1">
                {formatDate(issue.updated_at)}
              </p>
            </div>
            {issue.milestone && (
              <div className="col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Milestone
                </p>
                <p className="text-gray-900 dark:text-white mt-1">
                  {issue.milestone.title}
                </p>
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Description
            </h3>
            {issue.body ? (
              <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                {issue.body}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">
                No description provided
              </p>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{issue.comments} comments</span>
          </div>
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
