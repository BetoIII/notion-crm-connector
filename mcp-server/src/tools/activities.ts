import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getNotionClient } from "../notion-client.js";
import { loadSchema, addDatabaseToSchema, getDatabaseId } from "../schema/loader.js";
import { DatabaseDef } from "../schema/types.js";
import { createPage } from "../operations/create.js";
import { updatePage } from "../operations/update.js";
import { appendRelation } from "../operations/link.js";
import { queryDatabase } from "../operations/query.js";
import { searchByTitle } from "../operations/search.js";
import { formatActivitySummary } from "../utils/formatters.js";
import { todayISO } from "../utils/date-utils.js";
import { sanitizeNotionUUID } from "../utils/uuid.js";
import { ensureSchemaValid } from "../schema/validator.js";

export function registerActivityTools(server: McpServer): void {
  server.tool(
    "setup_activities_database",
    "Create the Activities database in Notion. Run this once to set up activity tracking. Creates a database with Type, Status, Date, Notes, Due Date, Priority, and relations to Contact, Account, and Opportunity.",
    {
      parent_page_id: z.string().describe("Notion page ID where the Activities database will be created"),
    },
    async (args) => {
      const notion = getNotionClient();
      const parentId = sanitizeNotionUUID(args.parent_page_id);

      // Check if activities DB already exists in schema
      const schema = loadSchema();
      if (schema.databases.activities) {
        return {
          content: [{ type: "text", text: `Activities database already configured: ${schema.databases.activities.id}` }],
        };
      }

      const contactsDbId = getDatabaseId("contacts");
      const accountsDbId = getDatabaseId("accounts");
      const opportunitiesDbId = getDatabaseId("opportunities");

      const response = await notion.databases.create({
        parent: { page_id: parentId },
        title: [{ text: { content: "📋 Activities" } }],
        properties: {
          "Activity Name": { title: {} },
          Type: {
            select: {
              options: [
                { name: "Call", color: "blue" },
                { name: "Email", color: "green" },
                { name: "Meeting", color: "purple" },
                { name: "Note", color: "yellow" },
                { name: "Task", color: "orange" },
              ],
            },
          },
          Status: {
            select: {
              options: [
                { name: "Planned", color: "gray" },
                { name: "Completed", color: "green" },
                { name: "Cancelled", color: "red" },
              ],
            },
          },
          Date: { date: {} },
          Notes: { rich_text: {} },
          "Due Date": { date: {} },
          Priority: {
            select: {
              options: [
                { name: "High", color: "red" },
                { name: "Medium", color: "yellow" },
                { name: "Low", color: "green" },
              ],
            },
          },
          Contact: {
            relation: { database_id: contactsDbId, single_property: {} },
          },
          Account: {
            relation: { database_id: accountsDbId, single_property: {} },
          },
          Opportunity: {
            relation: { database_id: opportunitiesDbId, single_property: {} },
          },
        },
      });

      const dbId = response.id;

      const dbDef: DatabaseDef = {
        id: dbId,
        collection_id: dbId,
        name: "📋 Activities",
        display_name: "📋 Activities",
        properties: {
          "Activity Name": { id: "title", type: "title" },
          Type: { id: "type", type: "select", options: ["Call", "Email", "Meeting", "Note", "Task"] },
          Status: { id: "status", type: "select", options: ["Planned", "Completed", "Cancelled"] },
          Date: { id: "date", type: "date" },
          Notes: { id: "notes", type: "rich_text" },
          "Due Date": { id: "due_date", type: "date" },
          Priority: { id: "priority", type: "select", options: ["High", "Medium", "Low"] },
          Contact: { id: "contact", type: "relation" },
          Account: { id: "account", type: "relation" },
          Opportunity: { id: "opportunity", type: "relation" },
        },
      };

      addDatabaseToSchema("activities", dbDef);

      return {
        content: [{
          type: "text",
          text: `Activities database created successfully!\nDatabase ID: ${dbId}\nSchema updated and saved.`,
        }],
      };
    }
  );

  server.tool(
    "log_activity",
    "Log an activity (Call, Email, Meeting, or Note) with optional links to contact, account, and opportunity. Automatically updates the contact's Last Contact date.",
    {
      type: z.enum(["Call", "Email", "Meeting", "Note"]).describe("Activity type"),
      description: z.string().describe("Activity description/name"),
      notes: z.string().optional().describe("Detailed notes"),
      date: z.string().optional().describe("Activity date (YYYY-MM-DD, defaults to today)"),
      contact_name: z.string().optional().describe("Contact name to link"),
      contact_id: z.string().optional().describe("Or contact page ID directly"),
      account_name: z.string().optional().describe("Account name to link"),
      account_id: z.string().optional().describe("Or account page ID directly"),
      opportunity_name: z.string().optional().describe("Opportunity name to link"),
      opportunity_id: z.string().optional().describe("Or opportunity page ID directly"),
    },
    async (args) => {
      await ensureSchemaValid();

      const activityDate = args.date || todayISO();

      const data: Record<string, unknown> = {
        "Activity Name": args.description,
        Type: args.type,
        Status: "Completed",
        Date: activityDate,
      };
      if (args.notes) data["Notes"] = args.notes;

      const page = (await createPage("activities", data)) as { id: string };
      const pageId = page.id;

      // Resolve and link contact
      let contactId = args.contact_id;
      if (!contactId && args.contact_name) {
        const results = await searchByTitle("contacts", args.contact_name, 1);
        if (results.length > 0) {
          contactId = ((results[0]) as { id: string }).id;
        }
      }
      if (contactId) {
        await appendRelation(pageId, "Contact", [contactId]);
        // Update Last Contact date
        try {
          await updatePage(contactId, "contacts", { "Last Contact": activityDate });
        } catch (err) {
          console.error("[log_activity] Failed to update Last Contact:", err);
        }
      }

      // Resolve and link account
      let accountId = args.account_id;
      if (!accountId && args.account_name) {
        const results = await searchByTitle("accounts", args.account_name, 1);
        if (results.length > 0) {
          accountId = ((results[0]) as { id: string }).id;
        }
      }
      if (accountId) {
        await appendRelation(pageId, "Account", [accountId]);
      }

      // Resolve and link opportunity
      let oppId = args.opportunity_id;
      if (!oppId && args.opportunity_name) {
        const results = await searchByTitle("opportunities", args.opportunity_name, 1);
        if (results.length > 0) {
          oppId = ((results[0]) as { id: string }).id;
        }
      }
      if (oppId) {
        await appendRelation(pageId, "Opportunity", [oppId]);
      }

      return {
        content: [{
          type: "text",
          text: `Activity logged: ${args.type} - ${args.description}\nDate: ${activityDate}\nPage ID: ${pageId}${contactId ? `\nLinked contact: ${contactId}` : ""}${accountId ? `\nLinked account: ${accountId}` : ""}${oppId ? `\nLinked opportunity: ${oppId}` : ""}`,
        }],
      };
    }
  );

  server.tool(
    "create_task",
    "Create a task in the Activities database with status=Planned, type=Task, with due date and priority.",
    {
      description: z.string().describe("Task description/name"),
      due_date: z.string().describe("Due date (YYYY-MM-DD)"),
      priority: z.enum(["High", "Medium", "Low"]).optional().describe("Priority level"),
      notes: z.string().optional().describe("Additional notes"),
      contact_name: z.string().optional().describe("Contact name to link"),
      contact_id: z.string().optional().describe("Or contact page ID"),
      account_name: z.string().optional().describe("Account name to link"),
      account_id: z.string().optional().describe("Or account page ID"),
      opportunity_name: z.string().optional().describe("Opportunity name to link"),
      opportunity_id: z.string().optional().describe("Or opportunity page ID"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {
        "Activity Name": args.description,
        Type: "Task",
        Status: "Planned",
        "Due Date": args.due_date,
      };
      if (args.priority) data["Priority"] = args.priority;
      if (args.notes) data["Notes"] = args.notes;

      const page = (await createPage("activities", data)) as { id: string };
      const pageId = page.id;

      // Link relations
      let contactId = args.contact_id;
      if (!contactId && args.contact_name) {
        const results = await searchByTitle("contacts", args.contact_name, 1);
        if (results.length > 0) contactId = ((results[0]) as { id: string }).id;
      }
      if (contactId) await appendRelation(pageId, "Contact", [contactId]);

      let accountId = args.account_id;
      if (!accountId && args.account_name) {
        const results = await searchByTitle("accounts", args.account_name, 1);
        if (results.length > 0) accountId = ((results[0]) as { id: string }).id;
      }
      if (accountId) await appendRelation(pageId, "Account", [accountId]);

      let oppId = args.opportunity_id;
      if (!oppId && args.opportunity_name) {
        const results = await searchByTitle("opportunities", args.opportunity_name, 1);
        if (results.length > 0) oppId = ((results[0]) as { id: string }).id;
      }
      if (oppId) await appendRelation(pageId, "Opportunity", [oppId]);

      return {
        content: [{
          type: "text",
          text: `Task created: ${args.description}\nDue: ${args.due_date}${args.priority ? `\nPriority: ${args.priority}` : ""}\nPage ID: ${pageId}`,
        }],
      };
    }
  );

  server.tool(
    "add_note",
    "Add a quick note to the Activities database. Creates with type=Note, status=Completed, date=today.",
    {
      description: z.string().describe("Note title/description"),
      notes: z.string().optional().describe("Detailed note content"),
      contact_name: z.string().optional().describe("Contact name to link"),
      contact_id: z.string().optional().describe("Or contact page ID"),
      account_name: z.string().optional().describe("Account name to link"),
      account_id: z.string().optional().describe("Or account page ID"),
      opportunity_name: z.string().optional().describe("Opportunity name to link"),
      opportunity_id: z.string().optional().describe("Or opportunity page ID"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {
        "Activity Name": args.description,
        Type: "Note",
        Status: "Completed",
        Date: todayISO(),
      };
      if (args.notes) data["Notes"] = args.notes;

      const page = (await createPage("activities", data)) as { id: string };
      const pageId = page.id;

      // Link relations
      let contactId = args.contact_id;
      if (!contactId && args.contact_name) {
        const results = await searchByTitle("contacts", args.contact_name, 1);
        if (results.length > 0) contactId = ((results[0]) as { id: string }).id;
      }
      if (contactId) await appendRelation(pageId, "Contact", [contactId]);

      let accountId = args.account_id;
      if (!accountId && args.account_name) {
        const results = await searchByTitle("accounts", args.account_name, 1);
        if (results.length > 0) accountId = ((results[0]) as { id: string }).id;
      }
      if (accountId) await appendRelation(pageId, "Account", [accountId]);

      let oppId = args.opportunity_id;
      if (!oppId && args.opportunity_name) {
        const results = await searchByTitle("opportunities", args.opportunity_name, 1);
        if (results.length > 0) oppId = ((results[0]) as { id: string }).id;
      }
      if (oppId) await appendRelation(pageId, "Opportunity", [oppId]);

      return {
        content: [{
          type: "text",
          text: `Note added: ${args.description}\nPage ID: ${pageId}`,
        }],
      };
    }
  );

  server.tool(
    "get_activity_history",
    "Get activity history for a contact, account, or opportunity. Returns activities sorted by date (newest first).",
    {
      contact_name: z.string().optional().describe("Filter by contact name"),
      contact_id: z.string().optional().describe("Or filter by contact page ID"),
      account_name: z.string().optional().describe("Filter by account name"),
      account_id: z.string().optional().describe("Or filter by account page ID"),
      opportunity_name: z.string().optional().describe("Filter by opportunity name"),
      opportunity_id: z.string().optional().describe("Or filter by opportunity page ID"),
      type: z.enum(["Call", "Email", "Meeting", "Note", "Task"]).optional().describe("Filter by activity type"),
      limit: z.number().optional().describe("Max results (default 20)"),
    },
    async (args) => {
      await ensureSchemaValid();

      // Check if activities DB exists
      const schema = loadSchema();
      if (!schema.databases.activities) {
        return {
          content: [{ type: "text", text: "Activities database not set up yet. Run setup_activities_database first." }],
        };
      }

      const filters: Record<string, unknown>[] = [];

      // Resolve contact
      let contactId = args.contact_id;
      if (!contactId && args.contact_name) {
        const results = await searchByTitle("contacts", args.contact_name, 1);
        if (results.length > 0) contactId = ((results[0]) as { id: string }).id;
      }
      if (contactId) {
        filters.push({ property: "Contact", relation: { contains: contactId } });
      }

      // Resolve account
      let accountId = args.account_id;
      if (!accountId && args.account_name) {
        const results = await searchByTitle("accounts", args.account_name, 1);
        if (results.length > 0) accountId = ((results[0]) as { id: string }).id;
      }
      if (accountId) {
        filters.push({ property: "Account", relation: { contains: accountId } });
      }

      // Resolve opportunity
      let oppId = args.opportunity_id;
      if (!oppId && args.opportunity_name) {
        const results = await searchByTitle("opportunities", args.opportunity_name, 1);
        if (results.length > 0) oppId = ((results[0]) as { id: string }).id;
      }
      if (oppId) {
        filters.push({ property: "Opportunity", relation: { contains: oppId } });
      }

      // Type filter
      if (args.type) {
        filters.push({ property: "Type", select: { equals: args.type } });
      }

      if (filters.length === 0) {
        return { content: [{ type: "text", text: "Please provide at least one filter (contact, account, opportunity, or type)." }] };
      }

      const filter = filters.length === 1
        ? filters[0]
        : { and: filters };

      const results = await queryDatabase(
        "activities",
        filter,
        [{ property: "Date", direction: "descending" }],
        args.limit || 20
      );

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No activities found." }] };
      }

      const summaries = results.map((r) => formatActivitySummary(r as Record<string, unknown>));
      return {
        content: [{ type: "text", text: `Activity History (${results.length}):\n\n${summaries.join("\n\n---\n\n")}` }],
      };
    }
  );
}
