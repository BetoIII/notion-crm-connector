#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { registerContactTools } from "./tools/contacts.js";
import { registerAccountTools } from "./tools/accounts.js";
import { registerOpportunityTools } from "./tools/opportunities.js";
import { registerRelationshipTools } from "./tools/relationships.js";
import { registerPipelineTools } from "./tools/pipeline.js";
import { registerActivityTools } from "./tools/activities.js";
import { registerIntelligenceTools } from "./tools/intelligence.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";

const server = new McpServer({
  name: "notion-crm",
  version: "1.0.0",
});

// Phase 2: Core CRUD (10 tools)
registerContactTools(server);
registerAccountTools(server);
registerOpportunityTools(server);

// Phase 3: Relationships & Pipeline (5 tools)
registerRelationshipTools(server);
registerPipelineTools(server);

// Phase 4: Activities (5 tools)
registerActivityTools(server);

// Phase 5: Intelligence (6 tools)
registerIntelligenceTools(server);

// Phase 6: Resources & Prompts
registerResources(server);
registerPrompts(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Notion CRM MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
