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
      { 
        headers: this.getHeaders(),
        cache: 'no-store'
      }
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
      { 
        headers: this.getHeaders(),
        cache: 'no-store'
      }
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
      { 
        headers: this.getHeaders(),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch issue: ${response.statusText}`);
    }

    return response.json();
  }

  async getIssueComments(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<any[]> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      { 
        headers: this.getHeaders(),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    return response.json();
  }

  async getIssueEvents(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<any[]> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/events`,
      { 
        headers: this.getHeaders(),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch issue events: ${response.statusText}`);
    }

    return response.json();
  }

  async addIssueComment(
    owner: string,
    repo: string,
    issueNumber: number,
    body: string
  ): Promise<void> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ body }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body: string,
    labels?: string[],
    assignees?: string[]
  ): Promise<GitHubIssue> {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/issues`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          title,
          body,
          labels,
          assignees,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to create issue: ${response.statusText}`);
    }

    return response.json();
  }
}

export function createGitHubClient(token?: string): GitHubClient {
  return new GitHubClient(
    token || 
    process.env.GITHUB_TOKEN || 
    process.env.NEXT_PUBLIC_GITHUB_TOKEN || 
    null
  );
}
