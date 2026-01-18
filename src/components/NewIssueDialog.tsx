"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createGitHubClient } from "@/lib/github";

interface NewIssueDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueCreated: () => void;
  owner: string;
  repo: string;
}

export function NewIssueDialog({
  isOpen,
  onClose,
  onIssueCreated,
  owner,
  repo,
}: NewIssueDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const client = createGitHubClient();
      await client.createIssue(owner, repo, title, body);
      
      setTitle("");
      setBody("");
      onIssueCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create issue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Issue</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your issue a descriptive title"
              className="bg-muted/30 border-none focus-visible:ring-1"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body" className="text-sm font-semibold">
              Description
            </Label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Describe the problem or feature request"
              className="w-full min-h-[150px] p-3 rounded-md bg-muted/30 border-none focus:outline-none focus:ring-1 focus:ring-ring text-sm resize-none"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive font-medium bg-destructive/10 p-2 rounded">
              {error}
            </p>
          )}
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="h-9"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !title.trim()} className="h-9 gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Create Issue
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
