import { NextRequest, NextResponse } from "next/server";
import { listDB } from "@/lib/db/client";

/**
 * POST /api/lists/[id]/members
 * Add contacts to a list
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listId = parseInt(id, 10);
    const body = await request.json();
    const { contactIds } = body;

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: "Invalid list ID" },
        { status: 400 }
      );
    }

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "contactIds array is required" },
        { status: 400 }
      );
    }

    const list = listDB.getById(listId);
    if (!list) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    const added = listDB.addMembers(listId, contactIds);

    return NextResponse.json({
      success: true,
      addedCount: added,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    return NextResponse.json(
      { error: "Failed to add members" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists/[id]/members
 * Remove contacts from a list
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listId = parseInt(id, 10);
    const body = await request.json();
    const { contactIds } = body;

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: "Invalid list ID" },
        { status: 400 }
      );
    }

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      return NextResponse.json(
        { error: "contactIds array is required" },
        { status: 400 }
      );
    }

    const removed = listDB.removeMembers(listId, contactIds);

    return NextResponse.json({
      success: true,
      removedCount: removed,
    });
  } catch (error) {
    console.error("Error removing members:", error);
    return NextResponse.json(
      { error: "Failed to remove members" },
      { status: 500 }
    );
  }
}
