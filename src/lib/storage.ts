import { IssueScopingSession } from "@/types/devin";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readSessionsFile(): IssueScopingSession[] {
  ensureDataDir();
  if (!fs.existsSync(SESSIONS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(SESSIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeSessionsFile(sessions: IssueScopingSession[]): void {
  ensureDataDir();
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

export function getAllSessions(): IssueScopingSession[] {
  return readSessionsFile();
}

export function getSessionById(id: string): IssueScopingSession | null {
  const sessions = readSessionsFile();
  return sessions.find((s) => s.id === id) || null;
}

export function getSessionByIssue(
  repoOwner: string,
  repoName: string,
  issueNumber: number
): IssueScopingSession | null {
  const sessions = readSessionsFile();
  return (
    sessions.find(
      (s) =>
        s.repo_owner === repoOwner &&
        s.repo_name === repoName &&
        s.issue_number === issueNumber
    ) || null
  );
}

export function createSession(
  session: Omit<IssueScopingSession, "id" | "created_at" | "updated_at">
): IssueScopingSession {
  const sessions = readSessionsFile();
  const newSession: IssueScopingSession = {
    ...session,
    id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  sessions.push(newSession);
  writeSessionsFile(sessions);
  return newSession;
}

export function updateSession(
  id: string,
  updates: Partial<IssueScopingSession>
): IssueScopingSession | null {
  const sessions = readSessionsFile();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return null;

  sessions[index] = {
    ...sessions[index],
    ...updates,
    updated_at: new Date().toISOString(),
  };
  writeSessionsFile(sessions);
  return sessions[index];
}

export function deleteSession(id: string): boolean {
  const sessions = readSessionsFile();
  const index = sessions.findIndex((s) => s.id === id);
  if (index === -1) return false;

  sessions.splice(index, 1);
  writeSessionsFile(sessions);
  return true;
}
