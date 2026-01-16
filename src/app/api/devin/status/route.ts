import { NextRequest, NextResponse } from "next/server";
import { createDevinClient } from "@/lib/devin";
import { getSessionById, updateSession } from "@/lib/storage";

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

    if (devinStatus.status === "completed") {
      if (isScoping) {
        const scopingResult = devinClient.parseScopingResult(
          devinStatus.structured_output
        );
        updatedSession = updateSession(session.id, {
          status: "scoped",
          scoping_result: scopingResult,
        }) || session;
      } else if (isFixing) {
        const fixResult = devinClient.parseFixResult(
          devinStatus.structured_output
        );
        updatedSession = updateSession(session.id, {
          status: "fixed",
          fix_result: fixResult,
        }) || session;
      }
    } else if (devinStatus.status === "failed") {
      updatedSession = updateSession(session.id, {
        status: "failed",
      }) || session;
    }

    return NextResponse.json({
      session: updatedSession,
      devin_status: devinStatus.status,
      structured_output: devinStatus.structured_output,
    });
  } catch (error) {
    return NextResponse.json(
      { error: `Failed to get session status: ${error}` },
      { status: 500 }
    );
  }
}
