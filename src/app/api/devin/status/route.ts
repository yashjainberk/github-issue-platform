import { NextRequest, NextResponse } from "next/server";
import { createDevinClient } from "@/lib/devin";
import { getSessionById, updateSession } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing session_id parameter" },
        { status: 400 }
      );
    }

    const session = getSessionById(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const devinClient = createDevinClient();
    if (!devinClient) {
      return NextResponse.json(
        { error: "Devin API key not configured" },
        { status: 500 }
      );
    }

    const isScoping = session.status === "scoping";
    const isFixing = session.status === "fixing";
    const devinSessionId = isScoping
      ? session.devin_session_id
      : session.fix_session_id;

    if (!devinSessionId) {
      return NextResponse.json(
        { error: "No active Devin session found" },
        { status: 400 }
      );
    }

    const devinStatus = await devinClient.getSessionStatus(devinSessionId);

    let updatedSession = session;
    // We consider it "finished" if the enum is 'finished' or if the session is no longer 'working' 
    // and we have a result.
    const isWorking =
      devinStatus.status_enum === "working" ||
      devinStatus.status_enum === "resumed" ||
      devinStatus.status_enum?.includes("requested");
    const isFinished = devinStatus.status_enum === "finished" || (!isWorking && devinStatus.status_enum !== null);

    if (isScoping) {
      const scopingResult = devinClient.parseScopingResult(
        devinStatus.structured_output
      );
      if (scopingResult) {
        updatedSession =
          updateSession(session.id, {
            status: isFinished ? "scoped" : "scoping",
            scoping_result: scopingResult,
          }) || session;
      } else if (isFinished) {
        updatedSession =
          updateSession(session.id, {
            status: "scoped",
          }) || session;
      }
    } else if (isFixing) {
      const fixResult = devinClient.parseFixResult(
        devinStatus.structured_output
      );

      if (fixResult) {
        // If Devin created a PR, update the fix result with it
        if (devinStatus.pull_request?.url) {
          fixResult.pr_url = devinStatus.pull_request.url;
        }

        updatedSession =
          updateSession(session.id, {
            status: isFinished ? "fixed" : "fixing",
            fix_result: fixResult,
          }) || session;
      } else if (isFinished) {
        updatedSession =
          updateSession(session.id, {
            status: "fixed",
          }) || session;
      }
    }

    if (
      !isFinished &&
      (devinStatus.status_enum === "expired" || devinStatus.status === "failed")
    ) {
      updatedSession =
        updateSession(session.id, {
          status: "failed",
        }) || session;
    }

    return NextResponse.json({
      session: updatedSession,
      devin_status: devinStatus.status,
      devin_status_enum: devinStatus.status_enum,
      structured_output: devinStatus.structured_output,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get session status: ${error}` },
      { status: 500 }
    );
  }
}
