import { NextRequest, NextResponse } from "next/server";
import { connectedDBsDB, contactDB } from "@/lib/db/client";

/**
 * DELETE /api/notion/connect/[id]
 * Disconnect a Notion database
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const connectionId = parseInt(id, 10);

    if (isNaN(connectionId)) {
      return NextResponse.json(
        { error: "Invalid connection ID" },
        { status: 400 }
      );
    }

    // Get the connection to find the database ID
    const connection = connectedDBsDB.getById(connectionId);
    if (!connection) {
      return NextResponse.json(
        { error: "Connection not found" },
        { status: 404 }
      );
    }

    // Check if user wants to delete contacts
    const deleteContacts = request.nextUrl.searchParams.get("deleteContacts") === "true";

    if (deleteContacts) {
      // Delete all contacts from this database
      const deletedCount = contactDB.deleteBySource("notion", (connection as any).database_id);
      console.log(`Deleted ${deletedCount} contacts from database ${(connection as any).database_id}`);
    }

    // Disconnect the database
    const success = connectedDBsDB.disconnect(connectionId);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to disconnect database" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error disconnecting database:", error);
    return NextResponse.json(
      { error: "Failed to disconnect database" },
      { status: 500 }
    );
  }
}
