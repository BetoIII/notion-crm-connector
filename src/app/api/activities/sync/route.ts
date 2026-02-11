import { NextRequest, NextResponse } from "next/server";
import { activityDB, contactDB } from "@/lib/db/client";
import { getSession } from "@/lib/auth/session";
import { loadMcpSchema } from "@/lib/mcp/schema-reader";

export const dynamic = "force-dynamic";

const SYNC_COOLDOWN_SECONDS = 3600; // 1 hour

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contactIds: number[] = body.contact_ids;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "contact_ids array is required" },
        { status: 400 }
      );
    }

    const schema = loadMcpSchema();
    const activitiesDb = schema?.databases?.activities;

    if (!activitiesDb?.id) {
      return NextResponse.json({
        synced: 0,
        skipped: contactIds.length,
        reason: "Activities database not configured",
      });
    }

    const session = await getSession();
    const apiKey = session?.access_token || process.env.NOTION_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        synced: 0,
        skipped: contactIds.length,
        reason: "No API key configured",
      });
    }

    const now = Math.floor(Date.now() / 1000);
    let totalSynced = 0;
    let totalSkipped = 0;

    for (const contactId of contactIds) {
      // Check cooldown
      const lastSync = activityDB.getLastSyncTime(contactId);
      if (lastSync && now - lastSync < SYNC_COOLDOWN_SECONDS) {
        totalSkipped++;
        continue;
      }

      // Get contact's Notion source_id
      const contact = contactDB.getById(contactId) as {
        source_id?: string;
        source?: string;
      } | undefined;

      if (!contact?.source_id) {
        totalSkipped++;
        continue;
      }

      // Query Notion Activities DB for this contact's activities
      try {
        const res = await fetch(
          `https://api.notion.com/v1/databases/${activitiesDb.id}/query`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Notion-Version": "2022-06-28",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              filter: {
                property: "Contact",
                relation: { contains: contact.source_id },
              },
              page_size: 50,
            }),
          }
        );

        if (!res.ok) {
          totalSkipped++;
          continue;
        }

        const data = await res.json();
        const notionActivities = (data.results || []).map((page: Record<string, unknown>) => {
          const props = page.properties as Record<string, Record<string, unknown>>;
          return {
            contact_id: contactId,
            notion_activity_id: page.id as string,
            type: getSelectValue(props.Type) || "Note",
            description: getTitleValue(props.Name) || "Activity",
            notes: getRichTextValue(props.Notes),
            status: getSelectValue(props.Status) || "Completed",
            activity_date: getDateValue(props.Date) || now,
          };
        });

        if (notionActivities.length > 0) {
          activityDB.upsertFromNotion(notionActivities);
        }

        activityDB.updateSyncTime(contactId);
        totalSynced++;
      } catch {
        totalSkipped++;
      }
    }

    return NextResponse.json({
      synced: totalSynced,
      skipped: totalSkipped,
    });
  } catch (error: unknown) {
    console.error("Error syncing activities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Sync failed" },
      { status: 500 }
    );
  }
}

// Notion property value extractors
function getTitleValue(prop: Record<string, unknown> | undefined): string {
  if (!prop) return "";
  const arr = prop.title as Array<{ plain_text: string }> | undefined;
  return arr?.map((t) => t.plain_text).join("") || "";
}

function getRichTextValue(prop: Record<string, unknown> | undefined): string {
  if (!prop) return "";
  const arr = prop.rich_text as Array<{ plain_text: string }> | undefined;
  return arr?.map((t) => t.plain_text).join("") || "";
}

function getSelectValue(prop: Record<string, unknown> | undefined): string {
  if (!prop) return "";
  const sel = prop.select as { name: string } | null;
  return sel?.name || "";
}

function getDateValue(prop: Record<string, unknown> | undefined): number | null {
  if (!prop) return null;
  const d = prop.date as { start: string } | null;
  if (!d?.start) return null;
  return Math.floor(new Date(d.start).getTime() / 1000);
}
