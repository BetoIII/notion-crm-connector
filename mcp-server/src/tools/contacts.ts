import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { upsertContact, upsertAccount } from "../operations/upsert.js";
import { searchByTitle, searchByEmail, searchByFilter } from "../operations/search.js";
import { updatePage } from "../operations/update.js";
import { getPage } from "../operations/query.js";
import { sanitizeNotionUUID } from "../utils/uuid.js";
import { buildNotionFilter, FilterSpec, CompoundFilterSpec } from "../utils/filter-builder.js";
import { formatContactSummary } from "../utils/formatters.js";
import { validateContact } from "../utils/validation.js";
import { daysAgo } from "../utils/date-utils.js";
import { ensureSchemaValid } from "../schema/validator.js";

export function registerContactTools(server: McpServer): void {
  server.tool(
    "create_contact",
    "Create or update a contact in the CRM. Auto-deduplicates by email/name. If company is provided, auto-creates/finds account and links it. Resolves aliases for Buying Role and Engagement Level.",
    {
      name: z.string().describe("Contact full name"),
      email: z.string().optional().describe("Contact email address"),
      title: z.string().optional().describe("Job title"),
      phone: z.string().optional().describe("Phone number"),
      linkedin: z.string().optional().describe("LinkedIn profile URL"),
      company: z.string().optional().describe("Company name - will auto-create/link account"),
      buying_role: z.string().optional().describe("Buying role: Champion, Economic Buyer, Technical Buyer, Influencer, End User, Blocker"),
      engagement_level: z.string().optional().describe("Engagement level: Hot, Engaged, Neutral, Cold"),
      source: z.union([z.string(), z.array(z.string())]).optional().describe("Lead source(s)"),
      last_contact: z.string().optional().describe("Last contact date (YYYY-MM-DD)"),
      opportunity_id: z.string().optional().describe("Opportunity page ID to link"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {
        "Contact Name": args.name,
      };

      if (args.email) data["Contact Email"] = args.email;
      if (args.title) data["Title"] = args.title;
      if (args.phone) data["Contact Phone"] = args.phone;
      if (args.linkedin) data["LinkedIn"] = args.linkedin;
      if (args.buying_role) data["Buying Role"] = args.buying_role;
      if (args.engagement_level) data["Engagement Level"] = args.engagement_level;
      if (args.source) data["Source"] = args.source;
      if (args.last_contact) data["Last Contact"] = args.last_contact;

      const errors = validateContact(data);
      if (errors.length > 0) {
        return {
          content: [{ type: "text", text: `Validation errors:\n${errors.map((e) => `- ${e.field}: ${e.message}`).join("\n")}` }],
        };
      }

      // Auto-upsert account if company provided
      let accountId: string | undefined;
      if (args.company) {
        const accountResult = await upsertAccount({ "Company  Name": args.company });
        accountId = accountResult.page_id;
      }

      const result = await upsertContact(data, accountId, args.opportunity_id);

      return {
        content: [{
          type: "text",
          text: `Contact ${result.action}: ${args.name}\nPage ID: ${result.page_id}${accountId ? `\nLinked to account: ${accountId}` : ""}${args.opportunity_id ? `\nLinked to opportunity: ${args.opportunity_id}` : ""}`,
        }],
      };
    }
  );

  server.tool(
    "search_contacts",
    "Search contacts by name, email, buying role, engagement level, or last contact date.",
    {
      name: z.string().optional().describe("Search by contact name (partial match)"),
      email: z.string().optional().describe("Search by exact email address"),
      buying_role: z.string().optional().describe("Filter by buying role"),
      engagement_level: z.string().optional().describe("Filter by engagement level"),
      last_contact_before_days: z.number().optional().describe("Find contacts not contacted in N days"),
      limit: z.number().optional().describe("Max results (default 10)"),
    },
    async (args) => {
      await ensureSchemaValid();

      // Simple email search
      if (args.email) {
        const result = await searchByEmail("contacts", args.email);
        if (!result) {
          return { content: [{ type: "text", text: "No contact found with that email." }] };
        }
        return { content: [{ type: "text", text: formatContactSummary(result as Record<string, unknown>) }] };
      }

      // Build compound filter
      const filters: (FilterSpec | CompoundFilterSpec)[] = [];

      if (args.buying_role) {
        filters.push({
          property: "Buying Role",
          type: "select",
          condition: "equals",
          value: args.buying_role,
        });
      }

      if (args.engagement_level) {
        filters.push({
          property: "Engagement Level",
          type: "select",
          condition: "equals",
          value: args.engagement_level,
        });
      }

      if (args.last_contact_before_days) {
        filters.push({
          property: "Last Contact",
          type: "date",
          condition: "before",
          value: daysAgo(args.last_contact_before_days),
        });
      }

      let results: unknown[];

      if (args.name && filters.length === 0) {
        results = await searchByTitle("contacts", args.name, args.limit || 10);
      } else if (filters.length > 0) {
        const filter = filters.length === 1
          ? buildNotionFilter(filters[0])
          : buildNotionFilter({ type: "compound", operator: "and", filters });
        results = await searchByFilter("contacts", filter, undefined, args.limit || 10);

        // If name also provided, filter client-side
        if (args.name) {
          const nameLower = args.name.toLowerCase();
          results = results.filter((r) => {
            const props = (r as Record<string, unknown>).properties as Record<string, unknown>;
            const titleProp = props["Contact Name"] as { title?: Array<{ plain_text: string }> };
            const title = titleProp?.title?.map((t) => t.plain_text).join("") || "";
            return title.toLowerCase().includes(nameLower);
          });
        }
      } else {
        return { content: [{ type: "text", text: "Please provide at least one search criterion." }] };
      }

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No contacts found matching your criteria." }] };
      }

      const summaries = results.map((r) => formatContactSummary(r as Record<string, unknown>));
      return {
        content: [{ type: "text", text: `Found ${results.length} contact(s):\n\n${summaries.join("\n\n---\n\n")}` }],
      };
    }
  );

  server.tool(
    "update_contact",
    "Update a contact's properties by page ID.",
    {
      page_id: z.string().describe("Notion page ID of the contact"),
      name: z.string().optional().describe("New contact name"),
      email: z.string().optional().describe("New email"),
      title: z.string().optional().describe("New job title"),
      phone: z.string().optional().describe("New phone"),
      linkedin: z.string().optional().describe("New LinkedIn URL"),
      buying_role: z.string().optional().describe("New buying role"),
      engagement_level: z.string().optional().describe("New engagement level"),
      source: z.union([z.string(), z.array(z.string())]).optional().describe("New source(s)"),
      last_contact: z.string().optional().describe("New last contact date (YYYY-MM-DD)"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {};
      if (args.name) data["Contact Name"] = args.name;
      if (args.email) data["Contact Email"] = args.email;
      if (args.title) data["Title"] = args.title;
      if (args.phone) data["Contact Phone"] = args.phone;
      if (args.linkedin) data["LinkedIn"] = args.linkedin;
      if (args.buying_role) data["Buying Role"] = args.buying_role;
      if (args.engagement_level) data["Engagement Level"] = args.engagement_level;
      if (args.source) data["Source"] = args.source;
      if (args.last_contact) data["Last Contact"] = args.last_contact;

      if (Object.keys(data).length === 0) {
        return { content: [{ type: "text", text: "No fields to update." }] };
      }

      await updatePage(args.page_id, "contacts", data);
      return { content: [{ type: "text", text: `Contact ${args.page_id} updated successfully.` }] };
    }
  );

  server.tool(
    "get_contact",
    "Get full details of a contact by page ID.",
    {
      page_id: z.string().describe("Notion page ID of the contact"),
    },
    async (args) => {
      await ensureSchemaValid();
      const cleanId = sanitizeNotionUUID(args.page_id);
      const page = await getPage(cleanId);
      return { content: [{ type: "text", text: formatContactSummary(page as Record<string, unknown>) }] };
    }
  );
}
