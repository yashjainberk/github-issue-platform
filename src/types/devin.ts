export interface ScopingResult {
  confidence_score: number;
  complexity: "low" | "medium" | "high";
  estimated_time: string;
  summary: string;
  action_plan: ActionPlanItem[];
  potential_risks: string[];
  files_to_modify: string[];
  dependencies: string[];
}

export interface ActionPlanItem {
  step: number;
  description: string;
  type: "analysis" | "implementation" | "testing" | "documentation";
}

export interface FixResult {
  success: boolean;
  pr_url: string | null;
  summary: string;
  changes_made: string[];
  tests_added: string[];
  notes: string;
}

export interface IssueScopingSession {
  id: string;
  issue_number: number;
  issue_title: string;
  repo_owner: string;
  repo_name: string;
  devin_session_id: string | null;
  devin_session_url: string | null;
  status: "pending" | "scoping" | "scoped" | "fixing" | "fixed" | "failed";
  scoping_result: ScopingResult | null;
  fix_session_id: string | null;
  fix_session_url: string | null;
  fix_result: FixResult | null;
  comment_posted?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DevinCreateSessionRequest {
  prompt: string;
}

export interface DevinCreateSessionResponse {
  session_id: string;
  url: string;
}

export interface DevinSessionStatusResponse {
  session_id: string;
  status: string;
  status_enum:
    | "working"
    | "blocked"
    | "expired"
    | "finished"
    | "suspend_requested"
    | "suspend_requested_frontend"
    | "resume_requested"
    | "resume_requested_frontend"
    | "resumed"
    | null;
  structured_output: Record<string, unknown> | null;
  pull_request?: {
    url: string;
  } | null;
}
