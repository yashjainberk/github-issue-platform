"use client";

import { useState, useEffect, useCallback } from "react";
import { GitHubIssue, IssueFilters } from "@/types/github";
import { createGitHubClient } from "@/lib/github";
import { IssueList } from "@/components/IssueList";
import { IssueFiltersComponent } from "@/components/IssueFilters";
import { IssueDetail } from "@/components/IssueDetail";
import { RepoConfig } from "@/components/RepoConfig";

const DEFAULT_FILTERS: IssueFilters = {
  state: "open",
  labels: [],
  assignee: null,
  sort: "updated",
  direction: "desc",
};

export default function Dashboard() {
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");
  const [token, setToken] = useState("");
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<IssueFilters>(DEFAULT_FILTERS);
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
  });

  const fetchIssues = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const client = createGitHubClient(token || undefined);
      const fetchedIssues = await client.getIssues(owner, repo, filters);
      setIssues(fetchedIssues);

      const openCount = fetchedIssues.filter((i) => i.state === "open").length;
      const closedCount = fetchedIssues.filter((i) => i.state === "closed").length;
      setStats({
        total: fetchedIssues.length,
        open: openCount,
        closed: closedCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issues");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, token, filters]);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const handleConfigChange = (newOwner: string, newRepo: string, newToken: string) => {
    setOwner(newOwner);
    setRepo(newRepo);
    setToken(newToken);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                GitHub Issues Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                View and manage issues from any GitHub repository
              </p>
            </div>
            <button
              onClick={fetchIssues}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RepoConfig
          owner={owner}
          repo={repo}
          token={token}
          onConfigChange={handleConfigChange}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Issues</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.total}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {stats.open}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Closed</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats.closed}
            </p>
          </div>
        </div>

        <IssueFiltersComponent filters={filters} onFiltersChange={setFilters} />

        <IssueList
          issues={issues}
          loading={loading}
          error={error}
          onIssueClick={setSelectedIssue}
        />
      </main>

      {selectedIssue && (
        <IssueDetail
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </div>
  );
}
