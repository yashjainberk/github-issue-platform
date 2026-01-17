"use client";

import { ExternalLink, MessageSquare } from "lucide-react";
import { GitHubIssue } from "@/types/github";
import { DevinActions } from "./DevinActions";
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function IssueDetail({ issue, onClose, repoOwner, repoName, devinApiKey }: IssueDetailProps) {
  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <div className="flex items-center gap-3">
            <Badge variant={issue.state === "open" ? "success" : "purple"}>
              {issue.state}
            </Badge>
            <span className="text-muted-foreground">
              #{issue.number}
            </span>
          </div>
          <DialogTitle className="text-2xl font-bold mt-2">
            {issue.title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {issue.labels.map((label) => (
              <Badge
                key={label.id}
                variant="outline"
                className="rounded-full"
                style={{
                  backgroundColor: `#${label.color}20`,
                  color: `#${label.color}`,
                  borderColor: `#${label.color}40`,
                }}
              >
                {label.name}
              </Badge>
            ))}
          </div>

          <Card className="p-4 mb-6 bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Author</p>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={issue.user.avatar_url}
                    alt={issue.user.login}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-foreground font-medium">
                    {issue.user.login}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assignees</p>
                <div className="flex items-center gap-2 mt-1">
                  {issue.assignees.length > 0 ? (
                    issue.assignees.map((assignee) => (
                      <img
                        key={assignee.id}
                        src={assignee.avatar_url}
                        alt={assignee.login}
                        title={assignee.login}
                        className="w-6 h-6 rounded-full"
                      />
                    ))
                  ) : (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-foreground mt-1">
                  {formatDate(issue.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated</p>
                <p className="text-foreground mt-1">
                  {formatDate(issue.updated_at)}
                </p>
              </div>
              {issue.milestone && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Milestone</p>
                  <p className="text-foreground mt-1">
                    {issue.milestone.title}
                  </p>
                </div>
              )}
            </div>
          </Card>

          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-lg font-semibold text-foreground mb-3">
              Description
            </h3>
            {issue.body ? (
              <Card className="p-4 bg-muted/50">
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {issue.body}
                </p>
              </Card>
            ) : (
              <p className="text-muted-foreground italic">
                No description provided
              </p>
            )}
          </div>

          <DevinActions
            issue={issue}
            repoOwner={repoOwner}
            repoName={repoName}
            devinApiKey={devinApiKey}
          />
        </div>

        <div className="p-6 border-t flex justify-between items-center">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageSquare className="w-5 h-5" />
            <span>{issue.comments} comments</span>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <a
              href={issue.html_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on GitHub
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
