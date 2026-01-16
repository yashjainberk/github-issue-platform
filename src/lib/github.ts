import { GitHubIssue, GitHubRepository, IssueFilters } from "@/types/github";

const GITHUB_API_BASE = "https://api.github.com";

export class GitHubClient {
  private token: string | null;

  constructor(token: string | null = null) {
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      Accept: "application/vnd.github.v3+json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch repository: ${response.statusText}`);
    }

    return response.json();
  }

  async getIssues(
    owner: string,
    repo: string,
    filters: Partial<IssueFilters> = {}
  ): Promise<GitHubIssue[]> {
    const params = new URLSearchParams();
    
    if (filters.state) params.append("state", filters.state);
    if (filters.labels && filters.labels.length > 0) {
      params.append("labels", filters.labels.join(","));
    }
    if (filters.assignee) params.append("assignee", filters.assignee);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.direction) params.append("direction", filters.direction);
    
    params.append("per_page", "100");

    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues?${params.toString()}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch issues: ${response.statusText}`);
    }

    const issues: GitHubIssue[] = await response.json();
    
    return issues.filter((issue) => !("pull_request" in issue));
  }

  async getIssue(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<GitHubIssue> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch issue: ${response.statusText}`);
    }

    return response.json();
  }
}

export function createGitHubClient(token?: string): GitHubClient {
  return new GitHubClient(token || process.env.NEXT_PUBLIC_GITHUB_TOKEN || null);
}
