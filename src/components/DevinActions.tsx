"use client";

import { useState, useEffect, useCallback } from "react";
import { GitHubIssue } from "@/types/github";
import { IssueScopingSession, ScopingResult } from "@/types/devin";

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

function getComplexityColor(complexity: string): string {
  switch (complexity) {
    case "low":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "medium":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "high":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
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
        `/api/sessions?repo_owner=${repoOwner}&repo_name=${repoName}&issue_number=${issue.number}`
      );
      const data = await response.json();
      if (data.session) {
        setSession(data.session);
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
      const response = await fetch(`/api/devin/status?session_id=${session.id}`);
      const data = await response.json();

      if (data.session) {
        setSession(data.session);

        if (
          data.devin_status === "completed" ||
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
    <div className="mt-4 space-y-4">
      <div className="flex items-center gap-4">
        <div
          className={`px-4 py-2 rounded-lg ${getConfidenceBgColor(
            result.confidence_score
          )}`}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Confidence Score
          </p>
          <p
            className={`text-2xl font-bold ${getConfidenceColor(
              result.confidence_score
            )}`}
          >
            {result.confidence_score}%
          </p>
        </div>
        <div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getComplexityColor(
              result.complexity
            )}`}
          >
            {result.complexity} complexity
          </span>
        </div>
        <div className="text-gray-600 dark:text-gray-400">
          <p className="text-sm">Estimated Time</p>
          <p className="font-medium">{result.estimated_time}</p>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
          Summary
        </h4>
        <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
      </div>

      {result.action_plan.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Action Plan
          </h4>
          <ol className="space-y-2">
            {result.action_plan.map((item) => (
              <li key={item.step} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 flex items-center justify-center text-sm font-medium">
                  {item.step}
                </span>
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 mr-2">
                    {item.type}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">
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
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Files to Modify
          </h4>
          <ul className="space-y-1">
            {result.files_to_modify.map((file, index) => (
              <li
                key={index}
                className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
              >
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.potential_risks.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
            Potential Risks
          </h4>
          <ul className="space-y-1">
            {result.potential_risks.map((risk, index) => (
              <li
                key={index}
                className="text-sm text-orange-700 dark:text-orange-300 flex items-start gap-2"
              >
                <svg
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  const renderFixResult = () => {
    if (!session?.fix_result) return null;

    const result = session.fix_result;

    return (
      <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center gap-2 mb-3">
          {result.success ? (
            <svg
              className="w-6 h-6 text-green-600 dark:text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          )}
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {result.success ? "Fix Completed" : "Fix Failed"}
          </h4>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-3">{result.summary}</p>

        {result.pr_url && (
          <a
            href={result.pr_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            View Pull Request
          </a>
        )}

        {result.changes_made.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Changes Made:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
              {result.changes_made.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const isScoping = session?.status === "scoping";
  const isScoped = session?.status === "scoped";
  const isFixing = session?.status === "fixing";
  const isFixed = session?.status === "fixed";
  const isFailed = session?.status === "failed";

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Devin Integration
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {!devinApiKey && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-300 text-sm">
          Devin API key is not configured. Please add your API key in the
          repository configuration to enable Devin integration.
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!session && (
          <button
            onClick={handleScope}
            disabled={loading || !devinApiKey}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            )}
            Scope with Devin
          </button>
        )}

        {isScoping && (
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
            <span>Scoping in progress...</span>
            {session?.devin_session_url && (
              <a
                href={session.devin_session_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Session
              </a>
            )}
          </div>
        )}

        {isScoped && (
          <button
            onClick={handleFix}
            disabled={loading || !devinApiKey}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            Fix with Devin
          </button>
        )}

        {isFixing && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
            <span>Fix in progress...</span>
            {session?.fix_session_url && (
              <a
                href={session.fix_session_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View Session
              </a>
            )}
          </div>
        )}

        {isFailed && (
          <div className="flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400">
              Session failed
            </span>
            <button
              onClick={handleScope}
              disabled={loading || !devinApiKey}
              className="text-blue-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {session?.scoping_result && renderScopingResult(session.scoping_result)}
      {isFixed && renderFixResult()}
    </div>
  );
}
