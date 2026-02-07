import { NextRequest, NextResponse } from "next/server";
import { connectedDBsDB, contactDB } from "@/lib/db/client";
import type { ConnectNotionDatabaseRequest, FieldMapping } from "@/lib/templates/types";

/**
 * GET /api/notion/connect
 * List all connected Notion databases
 */
export async function GET() {
  try {
    const databases = connectedDBsDB.getAll();

    // Add contact count for each database
    const databasesWithStats = databases.map((db: any) => {
      const contactCount = contactDB.getCount({
        source: "notion",
        source_database_id: db.database_id,
      });
      return {
        ...db,
        field_mapping: JSON.parse(db.field_mapping),
        contactCount,
      };
    });

    return NextResponse.json(databasesWithStats);
  } catch (error) {
    console.error("Error fetching connected databases:", error);
    return NextResponse.json(
      { error: "Failed to fetch connected databases" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/notion/connect
 * Connect a Notion database and import contacts
 */
export async function POST(request: NextRequest) {
  try {
    const body: ConnectNotionDatabaseRequest = await request.json();

    if (!body.database_id || !body.title || !body.field_mapping) {
      return NextResponse.json(
        { error: "Missing required fields: database_id, title, field_mapping" },
        { status: 400 }
      );
    }

    // Check if already connected
    const existing = connectedDBsDB.getByDatabaseId(body.database_id);
    if (existing) {
      return NextResponse.json(
        { error: "This database is already connected" },
        { status: 409 }
      );
    }

    // Save the connection
    const connectionId = connectedDBsDB.connect({
      database_id: body.database_id,
      title: body.title,
      icon: body.icon,
      field_mapping: JSON.stringify(body.field_mapping),
      auto_sync: body.auto_sync ? 1 : 0,
    });

    // Fetch records from Notion
    const notionRecords = await fetchNotionDatabaseRecords(body.database_id);

    // Map and import contacts
    const contacts = notionRecords.map((record: any) =>
      mapNotionRecordToContact(record, body.field_mapping, body.database_id)
    );

    contactDB.createMany(contacts);

    // Update last synced timestamp
    connectedDBsDB.updateLastSynced(Number(connectionId));

    return NextResponse.json({
      success: true,
      connectionId,
      importedCount: contacts.length,
    });
  } catch (error) {
    console.error("Error connecting database:", error);
    return NextResponse.json(
      { error: "Failed to connect database" },
      { status: 500 }
    );
  }
}

/**
 * Fetch all records from a Notion database
 */
async function fetchNotionDatabaseRecords(databaseId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/notion/databases/${databaseId}/records?raw=true`
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Failed to fetch Notion records:", errorText);
    throw new Error(`Failed to fetch Notion records: ${response.status}`);
  }

  const data = await response.json();
  return data.records || [];
}

/**
 * Map a Notion record to a contact
 */
function mapNotionRecordToContact(
  record: any,
  fieldMapping: FieldMapping,
  databaseId: string
) {
  const properties = record.properties || {};

  const getValue = (notionPropertyName: string | undefined) => {
    if (!notionPropertyName) return undefined;
    if (notionPropertyName === "__AUTO_SPLIT_FROM_NAME__") return undefined; // Handle auto-split separately
    const prop = properties[notionPropertyName];
    if (!prop) return undefined;

    // Handle different Notion property types
    if (prop.title?.length > 0) return prop.title[0]?.plain_text;
    if (prop.rich_text?.length > 0) return prop.rich_text[0]?.plain_text;
    if (prop.email) return prop.email;
    if (prop.phone_number) return prop.phone_number;
    if (prop.select?.name) return prop.select.name;
    if (prop.number) return String(prop.number);

    return undefined;
  };

  // Get the full name value
  const fullName = getValue(fieldMapping.name);

  // Handle auto-split for first_name and last_name
  let firstName = getValue(fieldMapping.first_name);
  let lastName = getValue(fieldMapping.last_name);

  if (fieldMapping.first_name === "__AUTO_SPLIT_FROM_NAME__" && fullName) {
    const parts = fullName.trim().split(/\s+/);
    firstName = parts[0] || "";
  }

  if (fieldMapping.last_name === "__AUTO_SPLIT_FROM_NAME__" && fullName) {
    const parts = fullName.trim().split(/\s+/);
    lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  }

  return {
    name: fullName,
    first_name: firstName,
    last_name: lastName,
    email: getValue(fieldMapping.email),
    phone: getValue(fieldMapping.phone),
    company: getValue(fieldMapping.company),
    title: getValue(fieldMapping.title),
    city: getValue(fieldMapping.city),
    state: getValue(fieldMapping.state),
    source: "notion" as const,
    source_id: record.id,
    source_database_id: databaseId,
    source_url: record.url,
  };
}
