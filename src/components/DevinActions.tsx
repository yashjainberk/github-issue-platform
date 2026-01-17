"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Lightbulb,
  Check,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Code,
  Loader2,
} from "lucide-react";
import { GitHubIssue } from "@/types/github";
import { IssueScopingSession, ScopingResult } from "@/types/devin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

interface DevinActionsProps {
  issue: GitHubIssue;
  repoOwner: string;
  repoName: string;
  devinApiKey: string;
}

function getConfidenceColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function getConfidenceBgColor(score: number): string {
  if (score >= 80) return "bg-green-100 dark:bg-green-900/30";
  if (score >= 50) return "bg-yellow-100 dark:bg-yellow-900/30";
  return "bg-red-100 dark:bg-red-900/30";
}

function getComplexityVariant(complexity: string): "success" | "warning" | "destructive" | "secondary" {
  switch (complexity) {
    case "low":
      return "success";
    case "medium":
      return "warning";
    case "high":
      return "destructive";
    default:
      return "secondary";
  }
}

export function DevinActions({
  issue,
  repoOwner,
  repoName,
  devinApiKey,
}: DevinActionsProps) {
  const [session, setSession] = useState<IssueScopingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/sessions?repo_owner=${repoOwner}&repo_name=${repoName}&issue_number=${issue.number}`,
        { cache: 'no-store' }
      );
      const data = await response.json();
      if (data.session) {
        setSession(data.session);
        // Resume polling if the session is in an active state
        if (data.session.status === "scoping" || data.session.status === "fixing") {
          setPolling(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch session:", err);
    }
  }, [repoOwner, repoName, issue.number]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const pollStatus = useCallback(async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/devin/status?session_id=${session.id}`, {
        cache: 'no-store'
      });
      const data = await response.json();

      if (data.session) {
        setSession(data.session);

        const isWorking =
          data.devin_status_enum === "working" ||
          data.devin_status_enum === "resumed" ||
          data.devin_status_enum?.includes("requested");

        if (
          !isWorking ||
          data.devin_status_enum === "finished" ||
          data.devin_status_enum === "expired" ||
          data.devin_status === "failed"
        ) {
          setPolling(false);
        }
      }
    } catch (err) {
      console.error("Failed to poll status:", err);
    }
  }, [session]);

  useEffect(() => {
    if (polling && session) {
      const interval = setInterval(pollStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [polling, session, pollStatus]);

  const handleScope = async () => {
    if (!devinApiKey) {
      setError("Devin API key is required. Please configure it in the settings.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/devin/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_owner: repoOwner,
          repo_name: repoName,
          issue_number: issue.number,
          issue_title: issue.title,
          issue_body: issue.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start scoping session");
      }

      setSession(data.session);
      setPolling(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start scoping");
    } finally {
      setLoading(false);
    }
  };

  const handleFix = async () => {
    if (!devinApiKey) {
      setError("Devin API key is required. Please configure it in the settings.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/devin/fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo_owner: repoOwner,
          repo_name: repoName,
          issue_number: issue.number,
          issue_title: issue.title,
          issue_body: issue.body,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to start fix session");
      }

      setSession(data.session);
      setPolling(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start fix");
    } finally {
      setLoading(false);
    }
  };

  const renderScopingResult = (result: ScopingResult) => (
    <Card className="mt-4 p-4 space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          className={`px-4 py-2 rounded-lg ${getConfidenceBgColor(
            result.confidence_score
          )}`}
        >
          <p className="text-sm text-muted-foreground">Confidence Score</p>
          <p
            className={`text-2xl font-bold ${getConfidenceColor(
              result.confidence_score
            )}`}
          >
            {result.confidence_score}%
          </p>
        </div>
        <div>
          <Badge variant={getComplexityVariant(result.complexity)}>
            {result.complexity} complexity
          </Badge>
        </div>
        <div className="text-muted-foreground">
          <p className="text-sm">Estimated Time</p>
          <p className="font-medium">{result.estimated_time}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-foreground mb-2">Summary</h4>
        <p className="text-muted-foreground">{result.summary}</p>
      </div>

      {result.action_plan.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2">Action Plan</h4>
          <ol className="space-y-2">
            {result.action_plan.map((item) => (
              <li key={item.step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-sm font-medium">
                  {item.step}
                </span>
                <div>
                  <Badge variant="secondary" className="mr-2 text-xs">
                    {item.type}
                  </Badge>
                  <span className="text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {result.files_to_modify.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2">Files to Modify</h4>
          <ul className="space-y-1">
            {result.files_to_modify.map((file, index) => (
              <li
                key={index}
                className="text-sm font-mono text-muted-foreground bg-muted px-2 py-1 rounded"
              >
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.potential_risks.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-2">Potential Risks</h4>
          <ul className="space-y-1">
            {result.potential_risks.map((risk, index) => (
              <li
                key={index}
                className="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );

  const renderFixResult = () => {
    if (!session?.fix_result) return null;

    const result = session.fix_result;

    return (
      <Alert variant={result.success ? "success" : "destructive"} className="mt-4">
        <div className="flex items-center gap-2 mb-3">
          {result.success ? (
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          )}
          <h4 className="font-semibold text-foreground">
            {result.success ? "Fix Completed" : "Fix Failed"}
          </h4>
        </div>

        <AlertDescription>
          <p className="text-muted-foreground mb-3">{result.summary}</p>

          {result.pr_url && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <a
                href={result.pr_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Code className="w-4 h-4 mr-2" />
                View Pull Request
              </a>
            </Button>
          )}

          {result.changes_made.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-foreground mb-1">
                Changes Made:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside">
                {result.changes_made.map((change, index) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  const isScoping = session?.status === "scoping";
  const isScoped = session?.status === "scoped";
  const isFixing = session?.status === "fixing";
  const isFixed = session?.status === "fixed";
  const isFailed = session?.status === "failed";

  return (
    <div className="border-t pt-4 mt-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Devin Integration
      </h3>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!devinApiKey && (
        <Alert variant="warning" className="mb-4">
          <AlertDescription>
            Devin API key is not configured. Please add your API key in the
            repository configuration to enable Devin integration.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-3">
        {!session && (
          <Button
            onClick={handleScope}
            disabled={loading || !devinApiKey}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Lightbulb className="w-4 h-4" />
            )}
            Scope with Devin
          </Button>
        )}

        {isScoping && (
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scoping in progress...</span>
            {session?.devin_session_url && (
              <Button variant="link" asChild className="p-0 h-auto">
                <a
                  href={session.devin_session_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Session
                </a>
              </Button>
            )}
          </div>
        )}

        {isScoped && (
          <Button
            onClick={handleFix}
            disabled={loading || !devinApiKey}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Fix with Devin
          </Button>
        )}

        {isFixing && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Fix in progress...</span>
            {session?.fix_session_url && (
              <Button variant="link" asChild className="p-0 h-auto">
                <a
                  href={session.fix_session_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Session
                </a>
              </Button>
            )}
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400">
              Session failed
            </span>
            <Button
              variant="link"
              onClick={handleScope}
              disabled={loading || !devinApiKey}
              className="p-0 h-auto"
            >
              Retry
            </Button>
          </div>
        )}
      </div>

      {session?.scoping_result && renderScopingResult(session.scoping_result)}
      {isFixed && renderFixResult()}
    </div>
  );
}
