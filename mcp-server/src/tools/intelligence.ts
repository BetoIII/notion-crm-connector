import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { loadSchema } from "../schema/loader.js";
import { queryDatabase } from "../operations/query.js";
import { upsertContact, upsertAccount } from "../operations/upsert.js";
import { searchByFilter } from "../operations/search.js";
import { buildNotionFilter, CompoundFilterSpec } from "../utils/filter-builder.js";
import { formatContactSummary, formatOpportunitySummary } from "../utils/formatters.js";
import { parseEmailSignature } from "../utils/email-parser.js";
import { daysAgo, getTimeframeDates } from "../utils/date-utils.js";
import { validateContact } from "../utils/validation.js";
import { ensureSchemaValid } from "../schema/validator.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

type NotionPage = Record<string, unknown>;

function getPropertyValue(props: Record<string, unknown>, name: string): unknown {
  const prop = props[name] as Record<string, unknown> | undefined;
  if (!prop) return null;
  const type = prop.type as string;
  switch (type) {
    case "number": return prop.number;
    case "select": return (prop.select as { name: string } | null)?.name || null;
    case "title": {
      const arr = prop.title as Array<{ plain_text: string }> | undefined;
      return arr?.map((t) => t.plain_text).join("") || "";
    }
    case "date": {
      const d = prop.date as { start: string } | null;
      return d?.start || null;
    }
    default: return null;
  }
}

export function registerIntelligenceTools(server: McpServer): void {
  server.tool(
    "get_crm_schema",
    "Get the full CRM schema including databases, properties, select options, and aliases. Useful for understanding the data model.",
    {},
    async () => {
      const schema = loadSchema();
      return {
        content: [{ type: "text", text: JSON.stringify(schema, null, 2) }],
      };
    }
  );

  server.tool(
    "stalled_deals",
    "Find opportunities that haven't been updated recently. Shows active deals (not Closed Won/Lost) with no edits in the last N days.",
    {
      days: z.number().optional().describe("Number of days without updates to consider stalled (default 14)"),
    },
    async (args) => {
      await ensureSchemaValid();

      const staleDays = args.days || 14;
      const cutoff = daysAgo(staleDays);

      // Get all active opportunities
      const filter = buildNotionFilter({
        type: "compound",
        operator: "and",
        filters: [
          { property: "Stage", type: "select", condition: "does_not_equal", value: "Closed Won" },
          { property: "Stage", type: "select", condition: "does_not_equal", value: "Closed Lost" },
        ],
      } as CompoundFilterSpec);

      const results = await queryDatabase("opportunities", filter);

      // Filter by last_edited_time
      const stalled = results.filter((r) => {
        const page = r as { last_edited_time?: string };
        return page.last_edited_time && page.last_edited_time < cutoff;
      });

      if (stalled.length === 0) {
        return { content: [{ type: "text", text: `No stalled deals found (threshold: ${staleDays} days).` }] };
      }

      // Sort by staleness (oldest first)
      stalled.sort((a, b) => {
        const aTime = (a as { last_edited_time: string }).last_edited_time;
        const bTime = (b as { last_edited_time: string }).last_edited_time;
        return aTime.localeCompare(bTime);
      });

      const summaries = stalled.map((r) => {
        const page = r as { last_edited_time: string };
        const daysSinceEdit = Math.floor(
          (Date.now() - new Date(page.last_edited_time).getTime()) / (1000 * 60 * 60 * 24)
        );
        return `${formatOpportunitySummary(r as NotionPage)}\nLast Updated: ${daysSinceEdit} days ago`;
      });

      return {
        content: [{
          type: "text",
          text: `# Stalled Deals (${stalled.length})\nDeals with no updates in ${staleDays}+ days:\n\n${summaries.join("\n\n---\n\n")}`,
        }],
      };
    }
  );

  server.tool(
    "contacts_needing_followup",
    "Find contacts that need follow-up based on Last Contact date. Prioritizes by engagement level (hot contacts first).",
    {
      days: z.number().optional().describe("Days since last contact to flag (default 30)"),
      include_never_contacted: z.boolean().optional().describe("Include contacts with no Last Contact date (default true)"),
      limit: z.number().optional().describe("Max results (default 20)"),
    },
    async (args) => {
      await ensureSchemaValid();

      const thresholdDays = args.days || 30;
      const includeNever = args.include_never_contacted !== false;
      const cutoffDate = daysAgo(thresholdDays);

      const filters: Record<string, unknown>[] = [
        { property: "Last Contact", date: { before: cutoffDate } },
      ];

      if (includeNever) {
        filters.push({ property: "Last Contact", date: { is_empty: true } });
      }

      const filter = filters.length === 1
        ? filters[0]
        : { or: filters };

      const results = await queryDatabase("contacts", filter, undefined, args.limit || 20);

      if (results.length === 0) {
        return { content: [{ type: "text", text: "No contacts need follow-up." }] };
      }

      // Sort by engagement level priority
      const engagementOrder: Record<string, number> = {
        "🔥 Hot": 0,
        "✅ Engaged": 1,
        "😐 Neutral": 2,
        "❄️ Cold": 3,
      };

      results.sort((a, b) => {
        const propsA = (a as NotionPage).properties as Record<string, unknown>;
        const propsB = (b as NotionPage).properties as Record<string, unknown>;
        const engA = getPropertyValue(propsA, "Engagement Level") as string || "";
        const engB = getPropertyValue(propsB, "Engagement Level") as string || "";
        return (engagementOrder[engA] ?? 99) - (engagementOrder[engB] ?? 99);
      });

      const summaries = results.map((r) => {
        const props = (r as NotionPage).properties as Record<string, unknown>;
        const lastContact = getPropertyValue(props, "Last Contact") as string | null;
        const note = lastContact
          ? `Last contacted: ${lastContact}`
          : "Never contacted";
        return `${formatContactSummary(r as NotionPage)}\n${note}`;
      });

      return {
        content: [{
          type: "text",
          text: `# Contacts Needing Follow-up (${results.length})\nThreshold: ${thresholdDays} days\n\n${summaries.join("\n\n---\n\n")}`,
        }],
      };
    }
  );

  server.tool(
    "parse_email_to_contact",
    "Parse an email signature or body to extract contact information. Optionally auto-creates the contact in the CRM.",
    {
      email_text: z.string().describe("Email text containing signature to parse"),
      auto_create: z.boolean().optional().describe("Automatically create/upsert the contact (default false)"),
    },
    async (args) => {
      const parsed = parseEmailSignature(args.email_text);

      if (!parsed.name && !parsed.email) {
        return { content: [{ type: "text", text: "Could not extract contact information from the provided text." }] };
      }

      const lines = ["# Extracted Contact Information\n"];
      if (parsed.name) lines.push(`**Name**: ${parsed.name}`);
      if (parsed.email) lines.push(`**Email**: ${parsed.email}`);
      if (parsed.title) lines.push(`**Title**: ${parsed.title}`);
      if (parsed.phone) lines.push(`**Phone**: ${parsed.phone}`);
      if (parsed.company) lines.push(`**Company**: ${parsed.company}`);
      if (parsed.linkedin) lines.push(`**LinkedIn**: ${parsed.linkedin}`);

      if (args.auto_create && parsed.name) {
        await ensureSchemaValid();

        const data: Record<string, unknown> = { "Contact Name": parsed.name };
        if (parsed.email) data["Contact Email"] = parsed.email;
        if (parsed.title) data["Title"] = parsed.title;
        if (parsed.phone) data["Contact Phone"] = parsed.phone;
        if (parsed.linkedin) data["LinkedIn"] = parsed.linkedin;

        let accountId: string | undefined;
        if (parsed.company) {
          const accountResult = await upsertAccount({ "Company  Name": parsed.company });
          accountId = accountResult.page_id;
        }

        const result = await upsertContact(data, accountId);
        lines.push(`\n---\nContact ${result.action} in CRM: ${result.page_id}`);
        if (accountId) lines.push(`Account linked: ${accountId}`);
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "bulk_import_contacts",
    "Import multiple contacts at once. Validates all records, deduplicates by email, groups by company (upserts accounts first), then upserts contacts in batches.",
    {
      contacts: z
        .array(
          z.object({
            name: z.string(),
            email: z.string().optional(),
            title: z.string().optional(),
            phone: z.string().optional(),
            company: z.string().optional(),
            buying_role: z.string().optional(),
            engagement_level: z.string().optional(),
            source: z.string().optional(),
            linkedin: z.string().optional(),
          })
        )
        .describe("Array of contact objects to import"),
    },
    async (args) => {
      await ensureSchemaValid();

      const stats = { created: 0, updated: 0, skipped: 0, errors: 0 };
      const errorMessages: string[] = [];

      // Deduplicate by email
      const seen = new Set<string>();
      const uniqueContacts = args.contacts.filter((c) => {
        if (c.email) {
          const lower = c.email.toLowerCase();
          if (seen.has(lower)) {
            stats.skipped++;
            return false;
          }
          seen.add(lower);
        }
        return true;
      });

      // Validate all
      const validContacts: typeof uniqueContacts = [];
      for (const contact of uniqueContacts) {
        const errors = validateContact({
          "Contact Name": contact.name,
          "Contact Email": contact.email,
          "Contact Phone": contact.phone,
          LinkedIn: contact.linkedin,
        });
        if (errors.length > 0) {
          stats.errors++;
          errorMessages.push(`${contact.name}: ${errors.map((e) => e.message).join(", ")}`);
        } else {
          validContacts.push(contact);
        }
      }

      // Group by company and upsert accounts first
      const accountCache = new Map<string, string>();
      const companied = validContacts.filter((c) => c.company);
      const uniqueCompanies = [...new Set(companied.map((c) => c.company!))];

      for (const company of uniqueCompanies) {
        try {
          const result = await upsertAccount({ "Company  Name": company });
          accountCache.set(company, result.page_id);
        } catch (err) {
          console.error(`[bulk_import] Failed to upsert account "${company}":`, err);
        }
      }

      // Upsert contacts in batches
      const BATCH_SIZE = 10;
      for (let i = 0; i < validContacts.length; i += BATCH_SIZE) {
        const batch = validContacts.slice(i, i + BATCH_SIZE);

        for (const contact of batch) {
          try {
            const data: Record<string, unknown> = {
              "Contact Name": contact.name,
            };
            if (contact.email) data["Contact Email"] = contact.email;
            if (contact.title) data["Title"] = contact.title;
            if (contact.phone) data["Contact Phone"] = contact.phone;
            if (contact.linkedin) data["LinkedIn"] = contact.linkedin;
            if (contact.buying_role) data["Buying Role"] = contact.buying_role;
            if (contact.engagement_level) data["Engagement Level"] = contact.engagement_level;
            if (contact.source) data["Source"] = contact.source;

            const accountId = contact.company ? accountCache.get(contact.company) : undefined;
            const result = await upsertContact(data, accountId);

            if (result.action === "created") stats.created++;
            else stats.updated++;
          } catch (err) {
            stats.errors++;
            errorMessages.push(`${contact.name}: ${(err as Error).message}`);
          }
        }
      }

      const lines = [
        "# Bulk Import Results\n",
        `**Created**: ${stats.created}`,
        `**Updated**: ${stats.updated}`,
        `**Skipped** (duplicate email): ${stats.skipped}`,
        `**Errors**: ${stats.errors}`,
        `**Accounts processed**: ${uniqueCompanies.length}`,
      ];

      if (errorMessages.length > 0) {
        lines.push(`\n## Errors\n${errorMessages.map((e) => `- ${e}`).join("\n")}`);
      }

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "natural_search",
    "Search the CRM using natural language. Matches your query against predefined patterns to build Notion filters automatically.",
    {
      query: z.string().describe('Natural language search query (e.g., "hot contacts without activities", "deals over $50,000", "contacts from last week")'),
    },
    async (args) => {
      await ensureSchemaValid();

      let searchPatterns: { patterns: Array<{ id: string; pattern: string; description: string; database: string; filter_builder: Record<string, unknown> }>; timeframe_mappings: Record<string, { unit: string; offset: number }>; comparison_mappings: Record<string, string> };
      try {
        const patternsPath = resolve(__dirname, "../../data/search-patterns.json");
        searchPatterns = JSON.parse(readFileSync(patternsPath, "utf-8"));
      } catch {
        return { content: [{ type: "text", text: "Search patterns file not found." }] };
      }

      const queryLower = args.query.toLowerCase();

      for (const pattern of searchPatterns.patterns) {
        const regex = new RegExp(pattern.pattern, "i");
        const match = queryLower.match(regex);
        if (!match) continue;

        let filterBuilder = JSON.parse(JSON.stringify(pattern.filter_builder));
        const dbKey = pattern.database as "contacts" | "accounts" | "opportunities";

        // Replace captured values in filter builder
        const filterStr = JSON.stringify(filterBuilder);
        let resolved = filterStr;

        // Handle timeframe captures
        const timeframeMatch = queryLower.match(/(this|last)\s+(week|month|quarter|year)/i);
        if (timeframeMatch && resolved.includes("{captured_timeframe}")) {
          const key = `${timeframeMatch[1]} ${timeframeMatch[2]}`;
          const mapping = searchPatterns.timeframe_mappings[key];
          if (mapping) {
            const dates = getTimeframeDates(mapping.unit as "week" | "month" | "quarter" | "year", mapping.offset);
            resolved = resolved.replace(/"within"/g, '"on_or_after"');
            resolved = resolved.replace(/"\{captured_timeframe\}"/g, `"${dates.start}"`);
          }
        }

        // Handle comparison captures
        const compMatch = queryLower.match(/(over|above|under|below)/i);
        if (compMatch && resolved.includes("{captured_comparison}")) {
          const comp = searchPatterns.comparison_mappings[compMatch[1].toLowerCase()];
          resolved = resolved.replace(/\{captured_comparison\}/g, comp);
        }

        // Handle amount captures
        const amountMatch = queryLower.match(/\$([0-9,]+)/);
        if (amountMatch && resolved.includes("{captured_amount}")) {
          const amount = amountMatch[1].replace(/,/g, "");
          resolved = resolved.replace(/"\{captured_amount\}"/g, amount);
        }

        // Handle number captures
        const numMatch = queryLower.match(/(\d+)\s*days?/);
        if (numMatch && resolved.includes("{captured_number}")) {
          const days = parseInt(numMatch[1]);
          resolved = resolved.replace(/"\{captured_number\}"/g, `"${daysAgo(days)}"`);
        }

        filterBuilder = JSON.parse(resolved);

        const notionFilter = filterBuilder.type === "compound"
          ? buildNotionFilter(filterBuilder as CompoundFilterSpec)
          : buildNotionFilter(filterBuilder);

        const results = await searchByFilter(dbKey, notionFilter, undefined, 20);

        if (results.length === 0) {
          return { content: [{ type: "text", text: `No results for: "${args.query}"\nMatched pattern: ${pattern.description}` }] };
        }

        const formatFn = dbKey === "contacts" ? formatContactSummary
          : dbKey === "opportunities" ? formatOpportunitySummary
          : (p: NotionPage) => {
              const props = p.properties as Record<string, unknown>;
              const name = getPropertyValue(props, "Company  Name");
              return `**${name}**\nPage ID: ${(p as { id: string }).id}`;
            };

        const summaries = results.map((r) => formatFn(r as NotionPage));
        return {
          content: [{
            type: "text",
            text: `# Results for "${args.query}"\nPattern: ${pattern.description}\nFound ${results.length} result(s):\n\n${summaries.join("\n\n---\n\n")}`,
          }],
        };
      }

      // No pattern matched
      const available = searchPatterns.patterns.map((p) => `- ${p.description}`).join("\n");
      return {
        content: [{
          type: "text",
          text: `No matching search pattern for: "${args.query}"\n\nAvailable patterns:\n${available}`,
        }],
      };
    }
  );
}
