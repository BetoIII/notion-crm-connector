/**
 * SSE streaming endpoint for CRM creation
 * Returns real-time progress events as the databases are created
 */

import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createCRM } from "@/lib/notion/create-crm";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Allow up to 60 seconds for creation

export async function POST(request: NextRequest) {
  const session = await getSession();

  // For internal integration (dev mode), use API key from env
  const apiKey = session?.access_token || process.env.NOTION_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "No Notion API key found. Set NOTION_API_KEY in .env.local" },
      { status: 401 }
    );
  }

  try {
    const { schema, pageTitle, parentPageId } = await request.json();

    if (!schema) {
      return NextResponse.json(
        { error: "Schema is required" },
        { status: 400 }
      );
    }

    if (!pageTitle) {
      return NextResponse.json(
        { error: "Page title is required" },
        { status: 400 }
      );
    }

    // For internal integrations, parent page ID is required
    if (!session?.access_token && !parentPageId) {
      return NextResponse.json(
        { error: "Parent page ID is required when using internal integration. Please provide a Notion page ID where the CRM should be created." },
        { status: 400 }
      );
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of createCRM(schema, apiKey, pageTitle, parentPageId)) {
            const data = `data: ${JSON.stringify(event)}\n\n`;
            controller.enqueue(encoder.encode(data));
          }
          controller.close();
        } catch (error: any) {
          console.error('[CRM Create] Error:', error);
          const errorEvent = {
            step: 0,
            totalSteps: 0,
            phase: "error",
            message: "Failed to create CRM",
            status: "error",
            error: error.message || "Unknown error",
          };
          const data = `data: ${JSON.stringify(errorEvent)}\n\n`;
          controller.enqueue(encoder.encode(data));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("CRM creation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create CRM" },
      { status: 500 }
    );
  }
}
