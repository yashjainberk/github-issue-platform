"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, CircleDot, CheckCircle2, ListFilter, Plus } from "lucide-react";
import { GitHubIssue, IssueFilters } from "@/types/github";
import { createGitHubClient } from "@/lib/github";
import { IssueList } from "@/components/IssueList";
import { IssueFiltersComponent } from "@/components/IssueFilters";
import { IssueDetail } from "@/components/IssueDetail";
import { NewIssueDialog } from "@/components/NewIssueDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const [isNewIssueDialogOpen, setIsNewIssueDialogOpen] = useState(false);
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
      
      const [repoData, fetchedIssues, openIssuesResponse, closedIssuesResponse] = await Promise.all([
        client.getRepository(owner, repo),
        client.getIssues(owner, repo, filters),
        client.getIssues(owner, repo, { state: "open" }),
        client.getIssues(owner, repo, { state: "closed" })
      ]);

      setIssues(fetchedIssues);

      const openCount = openIssuesResponse.length;
      const closedCount = closedIssuesResponse.length;

      setStats({
        total: openCount + closedCount,
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary text-primary-foreground p-2 rounded-md">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  GitHub Issues
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  {repo}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="h-8 gap-1.5"
                onClick={() => setIsNewIssueDialogOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Issue</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Issues</p>
                <ListFilter className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{stats.total}</p>
                <Badge variant="secondary" className="font-normal">Overall</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Open</p>
                <CircleDot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{stats.open}</p>
                <Badge className="bg-blue-500/10 text-blue-500 dark:text-blue-400 border-none font-normal">
                  {Math.round((stats.open / (stats.total || 1)) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Closed</p>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold">{stats.closed}</p>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-normal">
                  {Math.round((stats.closed / (stats.total || 1)) * 100)}%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <IssueFiltersComponent filters={filters} onFiltersChange={setFilters} />

          <IssueList
            issues={issues}
            loading={loading}
            error={error}
            onIssueClick={setSelectedIssue}
          />
        </div>
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

      <NewIssueDialog
        isOpen={isNewIssueDialogOpen}
        onClose={() => setIsNewIssueDialogOpen(false)}
        onIssueCreated={fetchIssues}
        owner={owner}
        repo={repo}
      />
    </div>
  );
}
