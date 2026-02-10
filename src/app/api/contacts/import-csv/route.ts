import { NextRequest, NextResponse } from "next/server";
import { contactDB } from "@/lib/db/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contacts } = body;

    if (!Array.isArray(contacts) || contacts.length === 0) {
      return NextResponse.json(
        { error: "No contacts provided" },
        { status: 400 }
      );
    }

    // Add source metadata to each contact
    const contactsWithSource = contacts.map((contact: Record<string, string>) => ({
      ...contact,
      source: "csv",
      source_id: `csv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    }));

    contactDB.createMany(contactsWithSource);

    return NextResponse.json({
      success: true,
      importedCount: contactsWithSource.length,
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: "Failed to import contacts" },
      { status: 500 }
    );
  }
}
