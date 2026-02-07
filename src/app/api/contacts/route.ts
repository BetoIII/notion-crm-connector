import { NextRequest, NextResponse } from "next/server";
import { contactDB } from "@/lib/db/client";
import type { CreateContactRequest, PaginatedContactsResponse, Contact } from "@/lib/templates/types";

/**
 * GET /api/contacts
 * List contacts with pagination and search
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const source = searchParams.get("source") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "25", 10);
    const offset = (page - 1) * limit;

    const contacts = contactDB.getAll({ search, source, limit, offset }) as Contact[];
    const total = contactDB.getCount({ search, source });
    const totalPages = Math.ceil(total / limit);

    const response: PaginatedContactsResponse = {
      contacts,
      total,
      page,
      limit,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contacts
 * Create a new contact
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateContactRequest = await request.json();

    // Validate required fields
    if (!body.name && !body.first_name && !body.last_name) {
      return NextResponse.json(
        { error: "At least one name field is required" },
        { status: 400 }
      );
    }

    const contactId = contactDB.create({
      name: body.name,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      title: body.title,
      city: body.city,
      state: body.state,
      source: "manual",
    });

    const contact = contactDB.getById(Number(contactId)) as Contact;

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
