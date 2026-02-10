import { NextRequest, NextResponse } from "next/server";
import { listDB } from "@/lib/db/client";

/**
 * GET /api/lists/[id]
 * Get a single list with its members
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listId = parseInt(id, 10);

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: "Invalid list ID" },
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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const offset = (page - 1) * limit;

    const members = listDB.getMembers(listId, { search, limit, offset });
    const totalMembers = listDB.getMemberCount(listId);

    return NextResponse.json({
      success: true,
      list,
      members,
      total: totalMembers,
      page,
      totalPages: Math.ceil(totalMembers / limit),
    });
  } catch (error) {
    console.error("Error fetching list:", error);
    return NextResponse.json(
      { error: "Failed to fetch list" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/lists/[id]
 * Update a list
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listId = parseInt(id, 10);
    const body = await request.json();
    const { name, description } = body;

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: "Invalid list ID" },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const updated = listDB.update(listId, name, description);
    if (!updated) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    const list = listDB.getById(listId);

    return NextResponse.json({
      success: true,
      list,
    });
  } catch (error) {
    console.error("Error updating list:", error);
    return NextResponse.json(
      { error: "Failed to update list" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lists/[id]
 * Delete a list
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listId = parseInt(id, 10);

    if (isNaN(listId)) {
      return NextResponse.json(
        { error: "Invalid list ID" },
        { status: 400 }
      );
    }

    const deleted = listDB.delete(listId);
    if (!deleted) {
      return NextResponse.json(
        { error: "List not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting list:", error);
    return NextResponse.json(
      { error: "Failed to delete list" },
      { status: 500 }
    );
  }
}
