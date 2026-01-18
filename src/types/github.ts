export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description: string | null;
}

export interface GitHubMilestone {
  id: number;
  number: number;
  title: string;
  description: string | null;
  state: "open" | "closed";
  due_on: string | null;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: "open" | "closed";
  state_reason: "completed" | "reopened" | "not_planned" | null;
  html_url: string;
  user: GitHubUser;
  assignees: GitHubUser[];
  labels: GitHubLabel[];
  milestone: GitHubMilestone | null;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  owner: GitHubUser;
  open_issues_count: number;
}

export interface GitHubComment {
  id: number;
  body: string;
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  html_url: string;
}

export interface GitHubIssueEvent {
  id: number;
  node_id: string;
  url: string;
  actor: GitHubUser;
  event: string;
  commit_id: string | null;
  commit_url: string | null;
  created_at: string;
  label?: {
    name: string;
    color: string;
  };
  assignee?: GitHubUser;
  assigner?: GitHubUser;
  milestone?: {
    title: string;
  };
  rename?: {
    from: string;
    to: string;
  };
}

export interface IssueFilters {
  state: "open" | "closed" | "all";
  labels: string[];
  assignee: string | null;
  sort: "created" | "updated" | "comments";
  direction: "asc" | "desc";
}
