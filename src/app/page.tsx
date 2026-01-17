"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { GitHubIssue, IssueFilters } from "@/types/github";
import { createGitHubClient } from "@/lib/github";
import { IssueList } from "@/components/IssueList";
import { IssueFiltersComponent } from "@/components/IssueFilters";
import { IssueDetail } from "@/components/IssueDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_FILTERS: IssueFilters = {
  state: "open",
  labels: [],
  assignee: null,
  sort: "updated",
  direction: "desc",
};

export default function Dashboard() {
  const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER || "yashjainberk";
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO || "github-issue-platform";
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || "";
  const devinApiKey = process.env.NEXT_PUBLIC_DEVIN_API_KEY || "";

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
            <Button
              onClick={fetchIssues}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total Issues</p>
              <p className="text-3xl font-bold text-foreground">
                {stats.total}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.open}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Closed</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.closed}
              </p>
            </CardContent>
          </Card>
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
                repoOwner={owner}
                repoName={repo}
                devinApiKey={devinApiKey}
              />
            )}
    </div>
  );
}
