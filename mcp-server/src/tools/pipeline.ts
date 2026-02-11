import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { queryDatabase } from "../operations/query.js";
import { updatePage } from "../operations/update.js";
import { STAGE_PROBABILITIES } from "../schema/types.js";
import { buildNotionFilter, CompoundFilterSpec } from "../utils/filter-builder.js";
import { formatOpportunitySummary } from "../utils/formatters.js";
import { getTimeframeDates } from "../utils/date-utils.js";
import { ensureSchemaValid } from "../schema/validator.js";

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
    default: return null;
  }
}

export function registerPipelineTools(server: McpServer): void {
  server.tool(
    "get_pipeline",
    "Get the full sales pipeline grouped by stage with deal counts, total values, and weighted values.",
    {},
    async () => {
      await ensureSchemaValid();

      // Query all non-closed opportunities
      const filter = buildNotionFilter({
        type: "compound",
        operator: "and",
        filters: [
          { property: "Stage", type: "select", condition: "does_not_equal", value: "Closed Won" },
          { property: "Stage", type: "select", condition: "does_not_equal", value: "Closed Lost" },
        ],
      } as CompoundFilterSpec);

      const results = await queryDatabase("opportunities", filter, [{ property: "Stage", direction: "ascending" }]);

      // Group by stage
      const stages: Record<string, { count: number; totalValue: number; weightedValue: number; deals: string[] }> = {};

      for (const stageKey of Object.keys(STAGE_PROBABILITIES)) {
        if (stageKey === "Closed Won" || stageKey === "Closed Lost") continue;
        stages[stageKey] = { count: 0, totalValue: 0, weightedValue: 0, deals: [] };
      }

      for (const r of results) {
        const page = r as NotionPage;
        const props = page.properties as Record<string, unknown>;
        const stage = getPropertyValue(props, "Stage") as string;
        const value = (getPropertyValue(props, "Deal Value") as number) || 0;
        const prob = (getPropertyValue(props, "Close Probability") as number) || STAGE_PROBABILITIES[stage] || 0;
        const name = getPropertyValue(props, "Name") as string;

        if (!stages[stage]) {
          stages[stage] = { count: 0, totalValue: 0, weightedValue: 0, deals: [] };
        }

        stages[stage].count++;
        stages[stage].totalValue += value;
        stages[stage].weightedValue += value * (prob / 100);
        stages[stage].deals.push(`${name} ($${value.toLocaleString()})`);
      }

      const lines: string[] = ["# Sales Pipeline\n"];
      let totalPipeline = 0;
      let totalWeighted = 0;
      let totalDeals = 0;

      for (const [stage, data] of Object.entries(stages)) {
        if (data.count === 0) {
          lines.push(`**${stage}**: No deals`);
          continue;
        }
        lines.push(`**${stage}** (${data.count} deal${data.count > 1 ? "s" : ""})`);
        lines.push(`  Total: $${data.totalValue.toLocaleString()} | Weighted: $${Math.round(data.weightedValue).toLocaleString()}`);
        for (const deal of data.deals) {
          lines.push(`  - ${deal}`);
        }
        totalPipeline += data.totalValue;
        totalWeighted += data.weightedValue;
        totalDeals += data.count;
      }

      lines.push(`\n---\n**Total Pipeline**: $${totalPipeline.toLocaleString()} (${totalDeals} deals)`);
      lines.push(`**Weighted Pipeline**: $${Math.round(totalWeighted).toLocaleString()}`);

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );

  server.tool(
    "move_deal_stage",
    "Move an opportunity to a new stage. Automatically updates Close Probability based on stage defaults.",
    {
      page_id: z.string().describe("Opportunity page ID"),
      new_stage: z.string().describe("New stage: Discovery, Qualified, Demo/Pilot, Proposal, Negotiating, Contracting, Closed Won, Closed Lost"),
      lost_reason: z.string().optional().describe("Required if moving to Closed Lost"),
    },
    async (args) => {
      await ensureSchemaValid();

      const data: Record<string, unknown> = {
        Stage: args.new_stage,
      };

      const prob = STAGE_PROBABILITIES[args.new_stage];
      if (prob !== undefined) {
        data["Close Probability"] = prob;
      }

      if (args.lost_reason) {
        data["Lost Reason"] = args.lost_reason;
      }

      await updatePage(args.page_id, "opportunities", data);

      return {
        content: [{
          type: "text",
          text: `Deal moved to ${args.new_stage} (probability: ${prob !== undefined ? prob + "%" : "unchanged"})${args.lost_reason ? `\nLost Reason: ${args.lost_reason}` : ""}`,
        }],
      };
    }
  );

  server.tool(
    "pipeline_summary",
    "Get aggregate pipeline statistics: total pipeline, weighted pipeline, average deal size, deals closing soon, win rate.",
    {},
    async () => {
      await ensureSchemaValid();

      // Get all opportunities
      const allResults = await queryDatabase("opportunities");

      let activePipelineValue = 0;
      let activeWeighted = 0;
      let activeCount = 0;
      let wonCount = 0;
      let lostCount = 0;
      let wonValue = 0;

      const thisMonth = getTimeframeDates("month", 0);
      const thisQuarter = getTimeframeDates("quarter", 0);
      let closingThisMonth = 0;
      let closingThisQuarter = 0;

      for (const r of allResults) {
        const page = r as NotionPage;
        const props = page.properties as Record<string, unknown>;
        const stage = getPropertyValue(props, "Stage") as string;
        const value = (getPropertyValue(props, "Deal Value") as number) || 0;
        const prob = (getPropertyValue(props, "Close Probability") as number) || 0;

        const closeDateProp = props["Expected Close Date"] as { date?: { start: string } | null } | undefined;
        const closeDate = closeDateProp?.date?.start;

        if (stage === "Closed Won") {
          wonCount++;
          wonValue += value;
        } else if (stage === "Closed Lost") {
          lostCount++;
        } else {
          activeCount++;
          activePipelineValue += value;
          activeWeighted += value * (prob / 100);

          if (closeDate) {
            if (closeDate >= thisMonth.start && closeDate <= thisMonth.end) closingThisMonth++;
            if (closeDate >= thisQuarter.start && closeDate <= thisQuarter.end) closingThisQuarter++;
          }
        }
      }

      const totalClosedDeals = wonCount + lostCount;
      const winRate = totalClosedDeals > 0 ? Math.round((wonCount / totalClosedDeals) * 100) : 0;
      const avgDealSize = activeCount > 0 ? Math.round(activePipelineValue / activeCount) : 0;

      const lines = [
        "# Pipeline Summary\n",
        `**Active Pipeline**: $${activePipelineValue.toLocaleString()} (${activeCount} deals)`,
        `**Weighted Pipeline**: $${Math.round(activeWeighted).toLocaleString()}`,
        `**Average Deal Size**: $${avgDealSize.toLocaleString()}`,
        `**Closing This Month**: ${closingThisMonth} deal(s)`,
        `**Closing This Quarter**: ${closingThisQuarter} deal(s)`,
        `\n**Win Rate**: ${winRate}% (${wonCount}W / ${lostCount}L)`,
        `**Total Won Value**: $${wonValue.toLocaleString()}`,
      ];

      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
  );
}
