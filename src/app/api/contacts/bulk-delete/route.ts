import { NextRequest, NextResponse } from "next/server";
import { contactDB } from "@/lib/db/client";
import type { BulkDeleteContactsRequest } from "@/lib/templates/types";

/**
 * POST /api/contacts/bulk-delete
 * Delete multiple contacts
 */
export async function POST(request: NextRequest) {
  try {
    const body: BulkDeleteContactsRequest = await request.json();

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty IDs array" },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    for (const id of body.ids) {
      const success = contactDB.delete(id);
      if (success) {
        deletedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      totalRequested: body.ids.length,
    });
  } catch (error) {
    console.error("Error bulk deleting contacts:", error);
    return NextResponse.json(
      { error: "Failed to delete contacts" },
      { status: 500 }
    );
  }
}
