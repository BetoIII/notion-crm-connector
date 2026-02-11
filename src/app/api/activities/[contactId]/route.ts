import { NextRequest, NextResponse } from "next/server";
import { activityDB } from "@/lib/db/client";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ contactId: string }> }
) {
  const { contactId } = await params;
  const id = parseInt(contactId, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid contact ID" }, { status: 400 });
  }

  try {
    const activities = activityDB.getByContact(id);
    const lastSync = activityDB.getLastSyncTime(id);

    return NextResponse.json({
      activities,
      lastSyncedAt: lastSync,
    });
  } catch (error: unknown) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
