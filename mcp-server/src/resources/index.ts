import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { loadSchema } from "../schema/loader.js";
import { STAGE_PROBABILITIES } from "../schema/types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function registerResources(server: McpServer): void {
  server.resource(
    "crm-schema",
    "crm://schema",
    {
      description: "Full CRM schema including databases, properties, select options, and aliases",
      mimeType: "application/json",
    },
    async () => {
      const schema = loadSchema();
      return {
        contents: [{
          uri: "crm://schema",
          mimeType: "application/json",
          text: JSON.stringify(schema, null, 2),
        }],
      };
    }
  );

  server.resource(
    "pipeline-stages",
    "crm://pipeline/stages",
    {
      description: "Pipeline stage names with default close probabilities",
      mimeType: "application/json",
    },
    async () => {
      return {
        contents: [{
          uri: "crm://pipeline/stages",
          mimeType: "application/json",
          text: JSON.stringify(STAGE_PROBABILITIES, null, 2),
        }],
      };
    }
  );

  server.resource(
    "search-patterns",
    "crm://search-patterns",
    {
      description: "Available natural language search patterns for the CRM",
      mimeType: "application/json",
    },
    async () => {
      const patternsPath = resolve(__dirname, "../../data/search-patterns.json");
      const patterns = readFileSync(patternsPath, "utf-8");
      return {
        contents: [{
          uri: "crm://search-patterns",
          mimeType: "application/json",
          text: patterns,
        }],
      };
    }
  );
}
