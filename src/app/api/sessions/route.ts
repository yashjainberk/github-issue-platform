import { NextRequest, NextResponse } from "next/server";
import {
  getAllSessions,
  getSessionByIssue,
  createSession,
} from "@/lib/storage";
import { IssueScopingSession } from "@/types/devin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoOwner = searchParams.get("repo_owner");
  const repoName = searchParams.get("repo_name");
  const issueNumber = searchParams.get("issue_number");

  if (repoOwner && repoName && issueNumber) {
    const session = await getSessionByIssue(
      repoOwner,
      repoName,
      parseInt(issueNumber, 10)
    );
    return NextResponse.json({ session });
  }

  const sessions = await getAllSessions();
  return NextResponse.json({ sessions });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      issue_number,
      issue_title,
      repo_owner,
      repo_name,
      devin_session_id,
      devin_session_url,
      status,
    } = body;

    if (!issue_number || !issue_title || !repo_owner || !repo_name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existingSession = await getSessionByIssue(repo_owner, repo_name, issue_number);
    if (existingSession) {
      return NextResponse.json(
        { error: "Session already exists for this issue", session: existingSession },
        { status: 409 }
      );
    }

    const sessionData: Omit<IssueScopingSession, "id" | "created_at" | "updated_at"> = {
      issue_number,
      issue_title,
      repo_owner,
      repo_name,
      devin_session_id: devin_session_id || null,
      devin_session_url: devin_session_url || null,
      status: status || "pending",
      scoping_result: null,
      fix_session_id: null,
      fix_session_url: null,
      fix_result: null,
    };

    const session = await createSession(sessionData);
    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create session: ${error}` },
      { status: 500 }
    );
  }
}
