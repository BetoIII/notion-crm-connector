"use client";

import { useMcpStatus } from "@/hooks/use-mcp-status";
import { DatabaseStatusCard } from "./database-status-card";
import { ConfigSnippet } from "./config-snippet";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Key,
  Server,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface McpStatusPageProps {
  mcpPath: string;
}

export function McpStatusPage({ mcpPath }: McpStatusPageProps) {
  const { status, loading, error, refresh } = useMcpStatus();

  if (loading && !status) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-wood-medium" />
        <span className="ml-3 font-body text-smoke">
          Checking connections...
        </span>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="texture-paper card-paper rounded p-8 text-center">
        <AlertTriangle className="h-10 w-10 text-burnt-orange mx-auto mb-3" />
        <p className="font-heading font-bold text-charcoal mb-2">
          Connection Check Failed
        </p>
        <p className="text-sm font-body text-smoke mb-4">{error}</p>
        <Button onClick={refresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="space-y-6 fade-in">
      {/* Prerequisites Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* API Key Status */}
        <div className="texture-paper card-paper rounded p-5">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-1.5 ${status.hasApiKey ? "bg-olive/15" : "bg-burnt-orange/15"}`}
            >
              <Key
                className={`h-4 w-4 ${status.hasApiKey ? "text-olive" : "text-burnt-orange"}`}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-sm text-charcoal uppercase tracking-wide">
                Notion API Key
              </h3>
              {status.hasApiKey ? (
                <p className="text-xs font-body text-olive mt-1">
                  Configured and active
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-xs font-body text-smoke mb-2">
                    Set the <code className="font-mono text-amber-dim">NOTION_API_KEY</code>{" "}
                    environment variable in your{" "}
                    <code className="font-mono text-amber-dim">.env</code> file.
                  </p>
                  <div className="bg-tan/10 border border-tan/30 rounded px-3 py-2">
                    <code className="text-[11px] font-mono text-charcoal">
                      NOTION_API_KEY=ntn_...
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MCP Server Build Status */}
        <div className="texture-paper card-paper rounded p-5">
          <div className="flex items-start gap-3">
            <div
              className={`rounded-full p-1.5 ${status.mcpBuilt ? "bg-olive/15" : "bg-burnt-orange/15"}`}
            >
              <Server
                className={`h-4 w-4 ${status.mcpBuilt ? "text-olive" : "text-burnt-orange"}`}
              />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-sm text-charcoal uppercase tracking-wide">
                MCP Server
              </h3>
              {status.mcpBuilt ? (
                <p className="text-xs font-body text-olive mt-1">
                  Built and ready
                </p>
              ) : (
                <div className="mt-2">
                  <p className="text-xs font-body text-smoke mb-2">
                    Build the MCP server first:
                  </p>
                  <div className="bg-tan/10 border border-tan/30 rounded px-3 py-2">
                    <code className="text-[11px] font-mono text-charcoal">
                      npm run setup:mcp
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Database Grid */}
      <div>
        <h3 className="font-heading font-bold text-sm text-charcoal uppercase tracking-wider mb-3">
          CRM Databases
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {status.databases.map((db) => (
            <DatabaseStatusCard
              key={db.key}
              dbKey={db.key}
              name={db.name}
              id={db.id}
              accessible={db.accessible}
              error={db.error}
              propertyCount={db.propertyCount}
              onRefresh={refresh}
            />
          ))}
        </div>
      </div>

      {/* Claude Desktop Config */}
      <ConfigSnippet mcpServerPath={mcpPath} />
    </div>
  );
}
