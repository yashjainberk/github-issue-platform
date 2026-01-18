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
  if (score >= 80) return "text-emerald-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function getConfidenceBgColor(score: number): string {
  if (score >= 80) return "bg-emerald-500/10 border border-emerald-500/20";
  if (score >= 50) return "bg-amber-500/10 border border-amber-500/20";
  return "bg-red-500/10 border border-red-500/20";
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
    <Card className="mt-4 p-4 space-y-4 border shadow-sm bg-muted/20">
      <div className="flex flex-wrap items-center gap-4">
        <div className={`px-3 py-1.5 rounded-md ${getConfidenceBgColor(result.confidence_score)}`}>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Confidence</p>
          <p className={`text-xl font-bold ${getConfidenceColor(result.confidence_score)}`}>
            {result.confidence_score}%
          </p>
        </div>
        <div>
          <Badge variant="outline" className="border-muted-foreground/30 capitalize">
            {result.complexity} complexity
          </Badge>
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">Estimated Time</p>
          <p className="text-sm font-semibold">{result.estimated_time}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-bold mb-1.5">Summary</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
      </div>

      {result.action_plan.length > 0 && (
        <div>
          <h4 className="text-sm font-bold mb-1.5">Action Plan</h4>
          <div className="space-y-2">
            {result.action_plan.map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold border border-primary/20">
                  {item.step}
                </span>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground mr-1 capitalize">[{item.type}]</span>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );

  const renderFixResult = () => {
    if (!session?.fix_result) return null;
    
    // Don't show result if still in progress
    if (session.status === "fixing") return null;
    
    const result = session.fix_result;
    
    // Determine actual success: if there's a PR or changes, consider it successful
    const isSuccessful = result.success || !!result.pr_url || result.changes_made.length > 0;

    return (
      <Alert variant={isSuccessful ? "default" : "destructive"} className={`mt-4 ${isSuccessful ? "border-emerald-500/20 bg-emerald-500/5" : ""}`}>
        <div className="flex items-center gap-2 mb-3">
          {isSuccessful ? (
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <h4 className="font-bold text-sm">
            {isSuccessful ? "Fix Completed" : "Fix Failed"}
          </h4>
        </div>

        <AlertDescription className="space-y-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>

          {result.pr_url && (
            <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <a href={result.pr_url} target="_blank" rel="noopener noreferrer">
                <Code className="w-3.5 h-3.5 mr-2" />
                View Pull Request
              </a>
            </Button>
          )}

          {result.changes_made.length > 0 && (
            <div className="pt-2">
              <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2">Changes Made</p>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                {result.changes_made.map((change, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    {change}
                  </li>
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
    <div className="border-t pt-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary/10 p-1.5 rounded-md">
          <Code className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-base font-bold">Devin Agent</h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {!session && (
          <Button
            onClick={handleScope}
            disabled={loading || !devinApiKey}
            size="sm"
            className="gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lightbulb className="w-3.5 h-3.5" />}
            Analyze with Devin
          </Button>
        )}

        {isScoping && (
          <Button disabled size="sm" variant="outline" className="gap-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Analyzing...
          </Button>
        )}

        {isScoped && (
          <Button
            onClick={handleFix}
            disabled={loading || !devinApiKey}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            Apply Fix
          </Button>
        )}

        {isFixing && (
          <Button disabled size="sm" variant="outline" className="gap-2 text-emerald-600 border-emerald-600/20 bg-emerald-500/5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Applying Fix...
          </Button>
        )}
      </div>

      {session?.scoping_result && renderScopingResult(session.scoping_result)}
      {session?.fix_result && renderFixResult()}
    </div>
  );
}
