import { NextRequest, NextResponse } from "next/server";
import { listDB } from "@/lib/db/client";

/**
 * GET /api/lists
 * Get all lists with member counts, optionally filtered by type or search
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || undefined;
    const search = searchParams.get("search") || undefined;

    const lists = listDB.getAll({ type, search });

    return NextResponse.json({
      success: true,
      lists,
    });
  } catch (error) {
    console.error("Error fetching lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch lists" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lists
 * Create a new list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, description, contactIds } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: "Name and type are required" },
        { status: 400 }
      );
    }

    if (!["people", "companies"].includes(type)) {
      return NextResponse.json(
        { error: "Type must be 'people' or 'companies'" },
        { status: 400 }
      );
    }

    const listId = listDB.create(name, type, description);

    // Add initial members if provided
    if (Array.isArray(contactIds) && contactIds.length > 0) {
      listDB.addMembers(Number(listId), contactIds);
    }

    const list = listDB.getById(Number(listId));

    return NextResponse.json({
      success: true,
      list,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating list:", error);
    return NextResponse.json(
      { error: "Failed to create list" },
      { status: 500 }
    );
  }
}
