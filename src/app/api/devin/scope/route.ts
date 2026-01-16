import { NextRequest, NextResponse } from "next/server";
import { createDevinClient } from "@/lib/devin";
import { getSessionByIssue, createSession, updateSession } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo_owner, repo_name, issue_number, issue_title, issue_body } = body;

    if (!repo_owner || !repo_name || !issue_number || !issue_title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const devinClient = createDevinClient();
    if (!devinClient) {
      return NextResponse.json(
        { error: "Devin API key not configured. Please set NEXT_PUBLIC_DEVIN_API_KEY in your environment." },
        { status: 500 }
      );
    }

    let session = getSessionByIssue(repo_owner, repo_name, issue_number);

    if (session && session.status !== "pending" && session.status !== "failed") {
      return NextResponse.json(
        { error: "A scoping session is already in progress or completed for this issue", session },
        { status: 409 }
      );
    }

    const devinResponse = await devinClient.createScopingSession(
      repo_owner,
      repo_name,
      issue_number,
      issue_title,
      issue_body || ""
    );

    if (session) {
      session = updateSession(session.id, {
        devin_session_id: devinResponse.session_id,
        devin_session_url: devinResponse.url,
        status: "scoping",
      });
    } else {
      session = createSession({
        issue_number,
        issue_title,
        repo_owner,
        repo_name,
        devin_session_id: devinResponse.session_id,
        devin_session_url: devinResponse.url,
        status: "scoping",
        scoping_result: null,
        fix_session_id: null,
        fix_session_url: null,
        fix_result: null,
      });
    }

    return NextResponse.json({
      session,
      devin_session_id: devinResponse.session_id,
      devin_session_url: devinResponse.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create scoping session: ${error}` },
      { status: 500 }
    );
  }
}
