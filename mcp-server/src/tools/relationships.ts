import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { appendRelation } from "../operations/link.js";
import { searchByTitle } from "../operations/search.js";
import { queryDatabase, getPage } from "../operations/query.js";
import { sanitizeNotionUUID } from "../utils/uuid.js";
import { formatContactSummary, formatOpportunitySummary, formatAccountSummary } from "../utils/formatters.js";
import { ensureSchemaValid } from "../schema/validator.js";

export function registerRelationshipTools(server: McpServer): void {
  server.tool(
    "link_records",
    "Link two records via a relation property. Appends to existing relations without removing them.",
    {
      source_page_id: z.string().describe("Page ID of the source record"),
      target_page_id: z.string().describe("Page ID of the target record to link"),
      relation_property: z.string().describe("Name of the relation property on the source (e.g., 'Company', 'Buying Committee', 'Account')"),
    },
    async (args) => {
      await ensureSchemaValid();
      await appendRelation(args.source_page_id, args.relation_property, [args.target_page_id]);
      return {
        content: [{
          type: "text",
          text: `Linked ${args.source_page_id} → ${args.target_page_id} via "${args.relation_property}"`,
        }],
      };
    }
  );

  server.tool(
    "get_account_overview",
    "Get a comprehensive overview of an account including related contacts and opportunities.",
    {
      account_name: z.string().optional().describe("Search by account name"),
      account_id: z.string().optional().describe("Or provide account page ID directly"),
    },
    async (args) => {
      await ensureSchemaValid();

      let accountPage: Record<string, unknown> | null = null;

      if (args.account_id) {
        const cleanId = sanitizeNotionUUID(args.account_id);
        accountPage = (await getPage(cleanId)) as Record<string, unknown>;
      } else if (args.account_name) {
        const results = await searchByTitle("accounts", args.account_name, 1);
        if (results.length > 0) {
          accountPage = results[0] as Record<string, unknown>;
        }
      }

      if (!accountPage) {
        return { content: [{ type: "text", text: "Account not found." }] };
      }

      const accountId = (accountPage as { id: string }).id;
      const accountSummary = formatAccountSummary(accountPage);

      // Get related contacts
      const contactFilter = {
        property: "Company",
        relation: { contains: accountId },
      };
      const contacts = await queryDatabase("contacts", contactFilter, undefined, 50);
      const contactSummaries = contacts.map((c) => formatContactSummary(c as Record<string, unknown>));

      // Get related opportunities
      const oppFilter = {
        property: "Account",
        relation: { contains: accountId },
      };
      const opportunities = await queryDatabase("opportunities", oppFilter, undefined, 50);
      const oppSummaries = opportunities.map((o) => formatOpportunitySummary(o as Record<string, unknown>));

      const sections = [
        `## Account\n${accountSummary}`,
        `## Contacts (${contacts.length})\n${contactSummaries.length > 0 ? contactSummaries.join("\n\n") : "No contacts linked."}`,
        `## Opportunities (${opportunities.length})\n${oppSummaries.length > 0 ? oppSummaries.join("\n\n") : "No opportunities linked."}`,
      ];

      return { content: [{ type: "text", text: sections.join("\n\n---\n\n") }] };
    }
  );
}
