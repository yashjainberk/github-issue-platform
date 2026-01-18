import { NextRequest, NextResponse } from "next/server";
import { createDevinClient } from "@/lib/devin";
import { getSessionByIssue, updateSession } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo_owner, repo_name, issue_number, issue_title, issue_body } = body;

    if (!repo_owner || !repo_name || !issue_number) {
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

    const session = await getSessionByIssue(repo_owner, repo_name, issue_number);

    if (!session) {
      return NextResponse.json(
        { error: "No scoping session found for this issue. Please run scoping first." },
        { status: 404 }
      );
    }

    if (session.status !== "scoped") {
      return NextResponse.json(
        { error: `Cannot start fix session. Current status: ${session.status}. Scoping must be completed first.` },
        { status: 400 }
      );
    }

    if (!session.scoping_result) {
      return NextResponse.json(
        { error: "No scoping result available. Please run scoping again." },
        { status: 400 }
      );
    }

    const devinResponse = await devinClient.createFixSession(
      repo_owner,
      repo_name,
      issue_number,
      issue_title || session.issue_title,
      issue_body || "",
      session.scoping_result
    );

    const updatedSession = await updateSession(session.id, {
      fix_session_id: devinResponse.session_id,
      fix_session_url: devinResponse.url,
      status: "fixing",
    });

    return NextResponse.json({
      session: updatedSession,
      devin_session_id: devinResponse.session_id,
      devin_session_url: devinResponse.url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to create fix session: ${error}` },
      { status: 500 }
    );
  }
}
