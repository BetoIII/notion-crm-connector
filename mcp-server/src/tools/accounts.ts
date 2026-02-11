import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { upsertAccount } from "../operations/upsert.js";
import { searchByTitle, searchByFilter } from "../operations/search.js";
import { updatePage } from "../operations/update.js";
import { buildNotionFilter, FilterSpec, CompoundFilterSpec } from "../utils/filter-builder.js";
import { formatAccountSummary } from "../utils/formatters.js";
import { validateAccount } from "../utils/validation.js";
import { ensureSchemaValid } from "../schema/validator.js";

export function registerAccountTools(server: McpServer): void {
  server.tool(
    "create_account",
    "Create or find an account (company) in the CRM. Auto-deduplicates by company name.",
    {
      name: z.string().describe("Company name"),
      segment: z.string().optional().describe("Segment: SMB, Mid-Market, Enterprise"),
      company_type: z.union([z.string(), z.array(z.string())]).optional().describe("Company type(s)"),
      address: z.string().optional().describe("Street address"),
      city: z.string().optional().describe("City"),
      state: z.string().optional().describe("State abbreviation"),
      country: z.string().optional().describe("Country"),
      linkedin: z.string().optional().describe("Company LinkedIn URL"),
      notes: z.string().optional().describe("Account notes"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {
        "Company  Name": args.name,
      };

      if (args.segment) data["Segment"] = args.segment;
      if (args.company_type) data["Company Type"] = args.company_type;
      if (args.address) data["Address"] = args.address;
      if (args.city) data["City"] = args.city;
      if (args.state) data["State"] = args.state;
      if (args.country) data["Country"] = args.country;
      if (args.linkedin) data["LinkedIn"] = args.linkedin;
      if (args.notes) data["Notes"] = args.notes;

      const errors = validateAccount(data);
      if (errors.length > 0) {
        return {
          content: [{ type: "text", text: `Validation errors:\n${errors.map((e) => `- ${e.field}: ${e.message}`).join("\n")}` }],
        };
      }

      const result = await upsertAccount(data);
      return {
        content: [{
          type: "text",
          text: `Account ${result.action}: ${args.name}\nPage ID: ${result.page_id}`,
        }],
      };
    }
  );

  server.tool(
    "search_accounts",
    "Search accounts by name, segment, or company type.",
    {
      name: z.string().optional().describe("Search by company name (partial match)"),
      segment: z.string().optional().describe("Filter by segment"),
      company_type: z.string().optional().describe("Filter by company type"),
      limit: z.number().optional().describe("Max results (default 10)"),
    },
    async (args) => {
      await ensureSchemaValid();

      const filters: (FilterSpec | CompoundFilterSpec)[] = [];

      if (args.segment) {
        filters.push({
          property: "Segment",
          type: "select",
          condition: "equals",
          value: args.segment,
        });
      }

      if (args.company_type) {
        filters.push({
          property: "Company Type",
          type: "multi_select",
          condition: "contains",
          value: args.company_type,
        });
      }

      let results: unknown[];

      if (args.name && filters.length === 0) {
        results = await searchByTitle("accounts", args.name, args.limit || 10);
      } else if (filters.length > 0) {
        const filter = filters.length === 1
          ? buildNotionFilter(filters[0])
          : buildNotionFilter({ type: "compound", operator: "and", filters });
        results = await searchByFilter("accounts", filter, undefined, args.limit || 10);

        if (args.name) {
          const nameLower = args.name.toLowerCase();
          results = results.filter((r) => {
            const props = (r as Record<string, unknown>).properties as Record<string, unknown>;
            const titleProp = props["Company  Name"] as { title?: Array<{ plain_text: string }> };
            const title = titleProp?.title?.map((t) => t.plain_text).join("") || "";
            return title.toLowerCase().includes(nameLower);
          });
        }
      } else {
        return { content: [{ type: "text", text: "Please provide at least one search criterion." }] };
      }

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No accounts found matching your criteria." }] };
      }

      const summaries = results.map((r) => formatAccountSummary(r as Record<string, unknown>));
      return {
        content: [{ type: "text", text: `Found ${results.length} account(s):\n\n${summaries.join("\n\n---\n\n")}` }],
      };
    }
  );

  server.tool(
    "update_account",
    "Update an account's properties by page ID.",
    {
      page_id: z.string().describe("Notion page ID of the account"),
      name: z.string().optional().describe("New company name"),
      segment: z.string().optional().describe("New segment"),
      company_type: z.union([z.string(), z.array(z.string())]).optional().describe("New company type(s)"),
      address: z.string().optional().describe("New address"),
      city: z.string().optional().describe("New city"),
      state: z.string().optional().describe("New state"),
      country: z.string().optional().describe("New country"),
      linkedin: z.string().optional().describe("New LinkedIn URL"),
      notes: z.string().optional().describe("New notes"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {};
      if (args.name) data["Company  Name"] = args.name;
      if (args.segment) data["Segment"] = args.segment;
      if (args.company_type) data["Company Type"] = args.company_type;
      if (args.address) data["Address"] = args.address;
      if (args.city) data["City"] = args.city;
      if (args.state) data["State"] = args.state;
      if (args.country) data["Country"] = args.country;
      if (args.linkedin) data["LinkedIn"] = args.linkedin;
      if (args.notes) data["Notes"] = args.notes;

      if (Object.keys(data).length === 0) {
        return { content: [{ type: "text", text: "No fields to update." }] };
      }

      await updatePage(args.page_id, "accounts", data);
      return { content: [{ type: "text", text: `Account ${args.page_id} updated successfully.` }] };
    }
  );
}
