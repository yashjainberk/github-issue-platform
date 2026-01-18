"use client";

import { useState, useEffect } from "react";
import { 
  ExternalLink, 
  MessageSquare, 
  Loader2, 
  UserPlus, 
  Tag, 
  GitCommit, 
  CheckCircle2, 
  CircleDot, 
  History,
  Clock
} from "lucide-react";
import { GitHubIssue, GitHubComment, GitHubIssueEvent, getCategoryFromLabels, CATEGORY_DISPLAY_NAMES, CATEGORY_COLORS } from "@/types/github";
import { DevinActions } from "./DevinActions";
import { createGitHubClient } from "@/lib/github";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface IssueDetailProps {
  issue: GitHubIssue;
  onClose: () => void;
  repoOwner: string;
  repoName: string;
  devinApiKey: string;
}

type TimelineItem = 
  | { type: 'comment'; data: GitHubComment }
  | { type: 'event'; data: GitHubIssueEvent };

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  
  return date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
}

export function IssueDetail({ issue, onClose, repoOwner, repoName, devinApiKey }: IssueDetailProps) {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchTimeline() {
      setLoading(true);
      try {
        const client = createGitHubClient();
        const [fetchedComments, fetchedEvents] = await Promise.all([
          client.getIssueComments(repoOwner, repoName, issue.number),
          client.getIssueEvents(repoOwner, repoName, issue.number)
        ]);

        const combined: TimelineItem[] = [
          ...fetchedComments.map((c: GitHubComment): TimelineItem => ({ type: 'comment', data: c })),
          ...fetchedEvents.map((e: GitHubIssueEvent): TimelineItem => ({ type: 'event', data: e }))
        ];

        combined.sort((a, b) => {
          const dateA = new Date(a.data.created_at).getTime();
          const dateB = new Date(b.data.created_at).getTime();
          return dateA - dateB;
        });

        setTimeline(combined);
      } catch (err) {
        console.error("Failed to fetch timeline:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeline();
  }, [repoOwner, repoName, issue.number]);

  const renderEvent = (event: GitHubIssueEvent) => {
    const actor = event.actor;
    const time = formatRelativeTime(event.created_at);

    switch (event.event) {
      case 'assigned':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <UserPlus className="w-3.5 h-3.5" />
            <img src={actor.avatar_url} className="w-3.5 h-3.5 rounded-full border" />
            <span className="font-semibold text-foreground">{actor.login}</span>
            <span>assigned this to</span>
            <span className="font-semibold text-foreground">{event.assignee?.login}</span>
            <span>• {time}</span>
          </div>
        );
      case 'labeled':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Tag className="w-3.5 h-3.5" />
            <img src={actor.avatar_url} className="w-3.5 h-3.5 rounded-full border" />
            <span className="font-semibold text-foreground">{actor.login}</span>
            <span>added</span>
            <Badge 
              variant="outline" 
              className="px-1.5 py-0 text-[9px] font-bold uppercase tracking-tighter"
              style={{
                backgroundColor: `#${event.label?.color}15`,
                color: `#${event.label?.color}`,
                borderColor: `#${event.label?.color}30`,
              }}
            >
              {event.label?.name}
            </Badge>
            <span>label • {time}</span>
          </div>
        );
      case 'closed':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <img src={actor.avatar_url} className="w-3.5 h-3.5 rounded-full border" />
            <span className="font-semibold text-foreground">{actor.login}</span>
            <span>closed this</span>
            {event.commit_id && (
              <>
                <span>in</span>
                <code className="text-[10px] bg-muted px-1 rounded font-mono">{event.commit_id.substring(0, 7)}</code>
              </>
            )}
            <span>• {time}</span>
          </div>
        );
      case 'reopened':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CircleDot className="w-3.5 h-3.5 text-primary" />
            <img src={actor.avatar_url} className="w-3.5 h-3.5 rounded-full border" />
            <span className="font-semibold text-foreground">{actor.login}</span>
            <span>reopened this</span>
            <span>• {time}</span>
          </div>
        );
      case 'referenced':
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <GitCommit className="w-3.5 h-3.5" />
            <img src={actor.avatar_url} className="w-3.5 h-3.5 rounded-full border" />
            <span className="font-semibold text-foreground">{actor.login}</span>
            <span>referenced this</span>
            {event.commit_id && (
              <code className="text-[10px] bg-muted px-1 rounded font-mono">{event.commit_id.substring(0, 7)}</code>
            )}
            <span>• {time}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <History className="w-3.5 h-3.5" />
            <img src={actor.avatar_url} className="w-3.5 h-3.5 rounded-full border" />
            <span className="font-semibold text-foreground">{actor.login}</span>
            <span className="capitalize">{event.event.replace(/_/g, ' ')}</span>
            <span>• {time}</span>
          </div>
        );
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none bg-background shadow-2xl">
        <DialogHeader className="p-6 border-b bg-muted/20">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={issue.state === "open" ? "default" : "secondary"} className="h-5 px-1.5 uppercase tracking-wider text-[10px]">
              {issue.state}
            </Badge>
            {(() => {
              const category = getCategoryFromLabels(issue.labels);
              const categoryColor = CATEGORY_COLORS[category];
              return (
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px]"
                  style={{
                    backgroundColor: `#${categoryColor}15`,
                    color: `#${categoryColor}`,
                    borderColor: `#${categoryColor}40`,
                  }}
                >
                  {CATEGORY_DISPLAY_NAMES[category]}
                </Badge>
              );
            })()}
            <span className="text-muted-foreground text-sm font-medium">
              #{issue.number}
            </span>
          </div>
          <DialogTitle className="text-xl font-bold">
            {issue.title}
          </DialogTitle>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <img src={issue.user.avatar_url} className="w-4 h-4 rounded-full" />
            <span className="font-semibold text-foreground">{issue.user.login}</span>
            <span>opened this {formatRelativeTime(issue.created_at)}</span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap gap-1.5">
            {issue.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="rounded-full text-[10px] py-0"
                style={{
                  backgroundColor: `#${label.color}10`,
                  color: `#${label.color}`,
                  borderColor: `#${label.color}30`,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Description</h3>
            {issue.body ? (
              <Card className="p-4 bg-muted/10 border-none shadow-none text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {issue.body}
              </Card>
            ) : (
              <p className="text-muted-foreground italic text-sm">No description provided</p>
            )}
          </div>

          <DevinActions
            issue={issue}
            repoOwner={repoOwner}
            repoName={repoName}
            devinApiKey={devinApiKey}
          />

          <div className="space-y-6 pt-6 border-t">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Activity</h3>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : timeline.length > 0 ? (
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 pt-1">
                      {item.type === 'comment' ? (
                        <img src={item.data.user.avatar_url} className="w-6 h-6 rounded-full border" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                          <History className="w-3 h-3 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {item.type === 'comment' ? (
                        <Card className="p-3 bg-muted/5 border shadow-none">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-xs">{item.data.user.login}</span>
                            <span className="text-[10px] text-muted-foreground">{formatRelativeTime(item.data.created_at)}</span>
                          </div>
                          <p className="text-sm text-foreground whitespace-pre-wrap leading-normal">{item.data.body}</p>
                        </Card>
                      ) : (
                        <div className="flex items-center gap-2 py-1">
                          {renderEvent(item.data)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic">No activity yet</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end items-center bg-muted/5">
          <Button asChild variant="outline" size="sm">
            <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              View on GitHub
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
