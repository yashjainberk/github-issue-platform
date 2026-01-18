import {
  DevinCreateSessionResponse,
  DevinSessionStatusResponse,
  ScopingResult,
  FixResult,
} from "@/types/devin";

const DEVIN_API_BASE = "https://api.devin.ai/v1";

export class DevinClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };
  }

  async createSession(prompt: string): Promise<DevinCreateSessionResponse> {
    const response = await fetch(`${DEVIN_API_BASE}/sessions`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create Devin session: ${error}`);
    }

    return response.json();
  }

  async getSessionStatus(sessionId: string): Promise<DevinSessionStatusResponse> {
    const response = await fetch(`${DEVIN_API_BASE}/sessions/${sessionId}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get session status: ${error}`);
    }

    return response.json();
  }

  async createScopingSession(
    repoOwner: string,
    repoName: string,
    issueNumber: number,
    issueTitle: string,
    issueBody: string
  ): Promise<DevinCreateSessionResponse> {
    const structuredOutputSchema = JSON.stringify({
      confidence_score: 0,
      complexity: "medium",
      estimated_time: "",
      summary: "",
      action_plan: [],
      potential_risks: [],
      files_to_modify: [],
      dependencies: [],
    });

    const prompt = `Analyze and scope GitHub issue #${issueNumber} in @${repoOwner}/${repoName}.

Issue Title: ${issueTitle}

Issue Description:
${issueBody || "No description provided"}

Please analyze this issue and provide a detailed scoping assessment. Update the structured output with your findings in this exact format:
${structuredOutputSchema}

Instructions:
1. confidence_score: A number from 0-100 indicating how confident you are that this issue can be resolved programmatically
2. complexity: "low", "medium", or "high" based on the scope of changes needed
3. estimated_time: Human-readable estimate (e.g., "2-4 hours", "1-2 days")
4. summary: A brief summary of what needs to be done
5. action_plan: Array of steps with { step: number, description: string, type: "analysis" | "implementation" | "testing" | "documentation" }
6. potential_risks: Array of strings describing potential risks or blockers
7. files_to_modify: Array of file paths that will likely need changes
8. dependencies: Array of external dependencies or requirements

CRITICAL: Once you have a clear action plan, you MUST post it as a comment on the GitHub issue #${issueNumber}. The comment should be formatted nicely and explain what you've analyzed and what your plan is.

Please update the structured output immediately as you analyze the issue.`;

    return this.createSession(prompt);
  }

  async createFixSession(
    repoOwner: string,
    repoName: string,
    issueNumber: number,
    issueTitle: string,
    issueBody: string,
    scopingResult: ScopingResult
  ): Promise<DevinCreateSessionResponse> {
    const structuredOutputSchema = JSON.stringify({
      success: false,
      pr_url: null,
      summary: "",
      changes_made: [],
      tests_added: [],
      notes: "",
    });

    const prompt = `Fix GitHub issue #${issueNumber} in @${repoOwner}/${repoName}.

Issue Title: ${issueTitle}

Issue Description:
${issueBody || "No description provided"}

Scoping Analysis:
- Confidence Score: ${scopingResult.confidence_score}%
- Complexity: ${scopingResult.complexity}
- Estimated Time: ${scopingResult.estimated_time}
- Summary: ${scopingResult.summary}

Action Plan:
${scopingResult.action_plan.map((item) => `${item.step}. [${item.type}] ${item.description}`).join("\n")}

Files to Modify:
${scopingResult.files_to_modify.join("\n") || "To be determined"}

Please implement the fix following the action plan above. Create a PR with your changes.

Update the structured output with your progress in this exact format:
${structuredOutputSchema}

Instructions:
1. success: true if the fix was completed and PR created, false otherwise
2. pr_url: URL to the created PR (null if not created yet)
3. summary: Brief summary of what was done
4. changes_made: Array of descriptions of changes made
5. tests_added: Array of tests that were added
6. notes: Any additional notes or observations

Please update the structured output as you make progress.`;

    return this.createSession(prompt);
  }

  parseScopingResult(structuredOutput: any): ScopingResult | null {
    if (!structuredOutput) return null;

    let data = structuredOutput;
    if (typeof structuredOutput === "string") {
      try {
        data = JSON.parse(structuredOutput);
      } catch {
        return null;
      }
    }

    if (typeof data !== "object" || data === null) return null;

    try {
      return {
        confidence_score: (data.confidence_score as number) || 0,
        complexity: (data.complexity as ScopingResult["complexity"]) || "medium",
        estimated_time: (data.estimated_time as string) || "Unknown",
        summary: (data.summary as string) || "",
        action_plan: (data.action_plan as ScopingResult["action_plan"]) || [],
        potential_risks: (data.potential_risks as string[]) || [],
        files_to_modify: (data.files_to_modify as string[]) || [],
        dependencies: (data.dependencies as string[]) || [],
      };
    } catch {
      return null;
    }
  }

  parseFixResult(structuredOutput: any): FixResult | null {
    if (!structuredOutput) return null;

    let data = structuredOutput;
    if (typeof structuredOutput === "string") {
      try {
        data = JSON.parse(structuredOutput);
      } catch {
        return null;
      }
    }

    if (typeof data !== "object" || data === null) return null;

    try {
      return {
        success: (data.success as boolean) || false,
        pr_url: (data.pr_url as string) || null,
        summary: (data.summary as string) || "",
        changes_made: (data.changes_made as string[]) || [],
        tests_added: (data.tests_added as string[]) || [],
        notes: (data.notes as string) || "",
      };
    } catch {
      return null;
    }
  }
}

export function createDevinClient(apiKey?: string): DevinClient | null {
  const key = apiKey || process.env.NEXT_PUBLIC_DEVIN_API_KEY;
  if (!key) return null;
  return new DevinClient(key);
}
