import { NextRequest, NextResponse } from "next/server";
import { messageDB } from "@/lib/db/client";
import type { CreateSentMessageRequest } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/messages
 * Get all sent messages
 */
export async function GET() {
  try {
    const messages = messageDB.getAll();
    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/messages
 * Log a sent message
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateSentMessageRequest;

    // Validate input
    if (!body.contact_notion_url || body.contact_notion_url.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Contact Notion URL is required" },
        { status: 400 }
      );
    }

    if (!body.resolved_message || body.resolved_message.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Resolved message is required" },
        { status: 400 }
      );
    }

    // Create message record
    const messageId = messageDB.create(
      body.template_id,
      body.contact_notion_url.trim(),
      body.contact_name,
      body.phone_number,
      body.resolved_message.trim()
    );

    return NextResponse.json(
      { success: true, message_id: messageId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error logging message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log message" },
      { status: 500 }
    );
  }
}
