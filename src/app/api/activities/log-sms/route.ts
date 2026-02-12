import { NextRequest, NextResponse } from "next/server";
import { activityDB, messageDB } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { loadMcpSchema } from "@/lib/mcp/schema-reader";

export const dynamic = "force-dynamic";

interface SmsMessage {
  contact_id: number;
  contact_name: string;
  phone: string;
  message: string;
  template_id: number | null;
  source_id?: string | null;
  source_url?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const messages: SmsMessage[] = body.messages;
    const channel: string = body.channel || "sms";
    const activityType = channel === "whatsapp" ? "WhatsApp" : "SMS";

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const now = Math.floor(Date.now() / 1000);
    const results: Array<{ contact_id: number; activity_id: number; synced: boolean }> = [];

    // Check if Notion Activities DB is configured
    const schema = loadMcpSchema();
    const activitiesDb = schema?.databases?.activities;
    const session = await getSession();
    const apiKey = session?.access_token || process.env.NOTION_API_KEY;

    for (const msg of messages) {
      // 1. Insert into local activities table
      const activityId = activityDB.create({
        contact_id: msg.contact_id,
        type: activityType,
        description: `${activityType} sent to ${msg.contact_name}`,
        notes: msg.message,
        status: "Completed",
        activity_date: now,
      });

      // 2. Log to sent_messages table (preserve existing behavior)
      messageDB.create(
        msg.template_id,
        msg.source_url || `local://${msg.contact_id}`,
        msg.contact_name,
        msg.phone,
        msg.message
      );

      let synced = false;

      // 3. If Notion Activities DB configured, push to Notion
      if (activitiesDb?.id && apiKey && msg.source_id) {
        try {
          const notionRes = await fetch("https://api.notion.com/v1/pages", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              parent: { database_id: activitiesDb.id },
              properties: {
                Name: {
                  title: [{ text: { content: `${activityType} to ${msg.contact_name}` } }],
                },
                Type: { select: { name: "Email" } }, // Closest to SMS
                Status: { select: { name: "Completed" } },
                Date: { date: { start: new Date(now * 1000).toISOString().split("T")[0] } },
                Notes: {
                  rich_text: [{ text: { content: msg.message.substring(0, 2000) } }],
                },
                Contact: {
                  relation: [{ id: msg.source_id }],
                },
              },
            }),
          });

          if (notionRes.ok) {
            const notionPage = await notionRes.json();
            activityDB.markSyncedToNotion(activityId, notionPage.id);
            synced = true;
          }
        } catch {
          // Notion sync failed silently — activity still logged locally
        }
      }

      results.push({ contact_id: msg.contact_id, activity_id: activityId, synced });
    }

    return NextResponse.json({
      success: true,
      logged: results.length,
      results,
    });
  } catch (error: unknown) {
    console.error("Error logging SMS activities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to log activities" },
      { status: 500 }
    );
  }
}
