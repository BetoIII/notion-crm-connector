import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { upsertOpportunity, upsertAccount } from "../operations/upsert.js";
import { searchByTitle, searchByFilter } from "../operations/search.js";
import { updatePage } from "../operations/update.js";
import { buildNotionFilter, FilterSpec, CompoundFilterSpec } from "../utils/filter-builder.js";
import { formatOpportunitySummary } from "../utils/formatters.js";
import { validateOpportunity } from "../utils/validation.js";
import { ensureSchemaValid } from "../schema/validator.js";

export function registerOpportunityTools(server: McpServer): void {
  server.tool(
    "create_opportunity",
    "Create or update an opportunity (deal) in the CRM. Auto-deduplicates by name. Auto-links account and contacts. Sets Close Probability based on stage.",
    {
      name: z.string().describe("Opportunity/deal name"),
      stage: z.string().optional().describe("Stage: Discovery, Qualified, Demo/Pilot, Proposal, Negotiating, Contracting, Closed Won, Closed Lost"),
      deal_value: z.number().optional().describe("Deal value in dollars"),
      arr: z.number().optional().describe("Annual recurring revenue"),
      mrr: z.number().optional().describe("Monthly recurring revenue"),
      close_probability: z.number().optional().describe("Override auto-calculated probability (0-100)"),
      expected_close_date: z.string().optional().describe("Expected close date (YYYY-MM-DD)"),
      contract_start_date: z.string().optional().describe("Contract start date (YYYY-MM-DD)"),
      contract_length: z.number().optional().describe("Contract length in months"),
      opportunity_type: z.string().optional().describe("Type: New Business, Expansion, Renewal"),
      product_service: z.union([z.string(), z.array(z.string())]).optional().describe("Product/service(s)"),
      lead_source: z.union([z.string(), z.array(z.string())]).optional().describe("Lead source(s)"),
      next_step: z.string().optional().describe("Next step description"),
      account_name: z.string().optional().describe("Account name - will auto-create/link"),
      contact_ids: z.array(z.string()).optional().describe("Contact page IDs to add to Buying Committee"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {
        Name: args.name,
      };

      if (args.stage) data["Stage"] = args.stage;
      if (args.deal_value !== undefined) data["Deal Value"] = args.deal_value;
      if (args.arr !== undefined) data["ARR"] = args.arr;
      if (args.mrr !== undefined) data["MRR"] = args.mrr;
      if (args.close_probability !== undefined) data["Close Probability"] = args.close_probability;
      if (args.expected_close_date) data["Expected Close Date"] = args.expected_close_date;
      if (args.contract_start_date) data["Contract Start Date"] = args.contract_start_date;
      if (args.contract_length !== undefined) data["Contract Length"] = args.contract_length;
      if (args.opportunity_type) data["Opportunity Type"] = args.opportunity_type;
      if (args.product_service) data["Product/Service"] = args.product_service;
      if (args.lead_source) data["Lead Source"] = args.lead_source;
      if (args.next_step) data["Next Step"] = args.next_step;

      const errors = validateOpportunity(data);
      if (errors.length > 0) {
        return {
          content: [{ type: "text", text: `Validation errors:\n${errors.map((e) => `- ${e.field}: ${e.message}`).join("\n")}` }],
        };
      }

      // Auto-upsert account
      let accountId: string | undefined;
      if (args.account_name) {
        const accountResult = await upsertAccount({ "Company  Name": args.account_name });
        accountId = accountResult.page_id;
      }

      const result = await upsertOpportunity(data, accountId, args.contact_ids);

      return {
        content: [{
          type: "text",
          text: `Opportunity ${result.action}: ${args.name}\nPage ID: ${result.page_id}${accountId ? `\nLinked to account: ${accountId}` : ""}${args.contact_ids?.length ? `\nLinked ${args.contact_ids.length} contact(s) to Buying Committee` : ""}`,
        }],
      };
    }
  );

  server.tool(
    "search_opportunities",
    "Search opportunities by name, stage, deal value range, expected close date, or account.",
    {
      name: z.string().optional().describe("Search by opportunity name (partial match)"),
      stage: z.string().optional().describe("Filter by stage"),
      min_deal_value: z.number().optional().describe("Minimum deal value"),
      max_deal_value: z.number().optional().describe("Maximum deal value"),
      close_date_after: z.string().optional().describe("Expected close after date (YYYY-MM-DD)"),
      close_date_before: z.string().optional().describe("Expected close before date (YYYY-MM-DD)"),
      opportunity_type: z.string().optional().describe("Filter by opportunity type"),
      limit: z.number().optional().describe("Max results (default 10)"),
    },
    async (args) => {
      await ensureSchemaValid();

      const filters: (FilterSpec | CompoundFilterSpec)[] = [];

      if (args.stage) {
        filters.push({ property: "Stage", type: "select", condition: "equals", value: args.stage });
      }
      if (args.min_deal_value !== undefined) {
        filters.push({ property: "Deal Value", type: "number", condition: "greater_than_or_equal_to", value: args.min_deal_value });
      }
      if (args.max_deal_value !== undefined) {
        filters.push({ property: "Deal Value", type: "number", condition: "less_than_or_equal_to", value: args.max_deal_value });
      }
      if (args.close_date_after) {
        filters.push({ property: "Expected Close Date", type: "date", condition: "after", value: args.close_date_after });
      }
      if (args.close_date_before) {
        filters.push({ property: "Expected Close Date", type: "date", condition: "before", value: args.close_date_before });
      }
      if (args.opportunity_type) {
        filters.push({ property: "Opportunity Type", type: "select", condition: "equals", value: args.opportunity_type });
      }

      let results: unknown[];

      if (args.name && filters.length === 0) {
        results = await searchByTitle("opportunities", args.name, args.limit || 10);
      } else if (filters.length > 0) {
        const filter = filters.length === 1
          ? buildNotionFilter(filters[0])
          : buildNotionFilter({ type: "compound", operator: "and", filters });
        results = await searchByFilter("opportunities", filter, undefined, args.limit || 10);

        if (args.name) {
          const nameLower = args.name.toLowerCase();
          results = results.filter((r) => {
            const props = (r as Record<string, unknown>).properties as Record<string, unknown>;
            const titleProp = props["Name"] as { title?: Array<{ plain_text: string }> };
            const title = titleProp?.title?.map((t) => t.plain_text).join("") || "";
            return title.toLowerCase().includes(nameLower);
          });
        }
      } else {
        return { content: [{ type: "text", text: "Please provide at least one search criterion." }] };
      }

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No opportunities found matching your criteria." }] };
      }

      const summaries = results.map((r) => formatOpportunitySummary(r as Record<string, unknown>));
      return {
        content: [{ type: "text", text: `Found ${results.length} opportunity(ies):\n\n${summaries.join("\n\n---\n\n")}` }],
      };
    }
  );

  server.tool(
    "update_opportunity",
    "Update an opportunity's properties by page ID.",
    {
      page_id: z.string().describe("Notion page ID of the opportunity"),
      name: z.string().optional().describe("New opportunity name"),
      stage: z.string().optional().describe("New stage"),
      deal_value: z.number().optional().describe("New deal value"),
      arr: z.number().optional().describe("New ARR"),
      mrr: z.number().optional().describe("New MRR"),
      close_probability: z.number().optional().describe("New close probability"),
      expected_close_date: z.string().optional().describe("New expected close date"),
      contract_start_date: z.string().optional().describe("New contract start date"),
      contract_length: z.number().optional().describe("New contract length"),
      opportunity_type: z.string().optional().describe("New opportunity type"),
      next_step: z.string().optional().describe("New next step"),
      lost_reason: z.string().optional().describe("Lost reason (for Closed Lost)"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {};
      if (args.name) data["Name"] = args.name;
      if (args.stage) data["Stage"] = args.stage;
      if (args.deal_value !== undefined) data["Deal Value"] = args.deal_value;
      if (args.arr !== undefined) data["ARR"] = args.arr;
      if (args.mrr !== undefined) data["MRR"] = args.mrr;
      if (args.close_probability !== undefined) data["Close Probability"] = args.close_probability;
      if (args.expected_close_date) data["Expected Close Date"] = args.expected_close_date;
      if (args.contract_start_date) data["Contract Start Date"] = args.contract_start_date;
      if (args.contract_length !== undefined) data["Contract Length"] = args.contract_length;
      if (args.opportunity_type) data["Opportunity Type"] = args.opportunity_type;
      if (args.next_step) data["Next Step"] = args.next_step;
      if (args.lost_reason) data["Lost Reason"] = args.lost_reason;

      if (Object.keys(data).length === 0) {
        return { content: [{ type: "text", text: "No fields to update." }] };
      }

      await updatePage(args.page_id, "opportunities", data);
      return { content: [{ type: "text", text: `Opportunity ${args.page_id} updated successfully.` }] };
    }
  );
}
