import { NextRequest, NextResponse } from "next/server";
import { templateDB } from "@/lib/db/client";
import type { CreateTemplateRequest } from "@/lib/templates/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/templates
 * Get all message templates
 */
export async function GET() {
  try {
    const templates = templateDB.getAll();
    return NextResponse.json({ success: true, templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new message template
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTemplateRequest;

    // Validate input
    if (!body.name || body.name.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Template name is required" },
        { status: 400 }
      );
    }

    if (!body.content || body.content.trim() === "") {
      return NextResponse.json(
        { success: false, error: "Template content is required" },
        { status: 400 }
      );
    }

    // Create template
    const templateId = templateDB.create(body.name.trim(), body.content.trim());

    // Fetch created template
    const template = templateDB.getById(Number(templateId));

    return NextResponse.json(
      { success: true, template },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create template" },
      { status: 500 }
    );
  }
}
