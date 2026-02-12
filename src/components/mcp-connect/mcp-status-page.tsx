"use client";

import { useState } from "react";
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
  ChevronDown,
} from "lucide-react";

interface McpStatusPageProps {
  mcpPath: string;
}

export function McpStatusPage({ mcpPath }: McpStatusPageProps) {
  const { status, loading, error, refresh } = useMcpStatus();
  const [showPrereqDetails, setShowPrereqDetails] = useState(false);

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

  const allPrereqsMet = status.hasApiKey && status.mcpBuilt;

  return (
    <div className="space-y-6 fade-in">
      {/* ═══ Switchboard Panel ═══ */}
      <div className="texture-wood border-4 border-wood-dark rounded p-4 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-y-3">
          {/* Left: LED status indicators */}
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  status.hasApiKey ? "led-green" : "led-red"
                }`}
              />
              <span className="font-heading text-[11px] text-cream/70 uppercase tracking-wider">
                API Key
              </span>
            </div>

            <div className="w-px h-4 bg-cream/15" />

            <div className="flex items-center gap-2">
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  status.mcpBuilt ? "led-green" : "led-red"
                }`}
              />
              <span className="font-heading text-[11px] text-cream/70 uppercase tracking-wider">
                MCP Server
              </span>
            </div>

            {!allPrereqsMet && (
              <>
                <div className="w-px h-4 bg-cream/15" />
                <button
                  onClick={() => setShowPrereqDetails(!showPrereqDetails)}
                  className="flex items-center gap-1 text-[10px] font-body text-amber-glow/70 hover:text-amber-glow transition-colors"
                >
                  <span>Setup guide</span>
                  <ChevronDown
                    className={`h-3 w-3 transition-transform duration-200 ${
                      showPrereqDetails ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </>
            )}
          </div>

          {/* Right: Connection counter + refresh */}
          <div className="flex items-center gap-4">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-bold text-amber-glow text-embossed leading-none tabular-nums">
                {status.connectedCount}
              </span>
              <span className="font-heading text-sm text-cream/30 leading-none">
                /
              </span>
              <span className="font-heading text-sm text-cream/40 leading-none tabular-nums">
                {status.totalCount}
              </span>
              <span className="font-heading text-[9px] text-cream/35 uppercase tracking-[0.2em] ml-1.5">
                databases online
              </span>
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="p-1.5 rounded hover:bg-cream/10 transition-colors disabled:opacity-40"
              title="Refresh status"
            >
              <RefreshCw
                className={`h-4 w-4 text-cream/40 hover:text-cream/70 transition-colors ${
                  loading ? "animate-spin" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Expandable prerequisite details */}
        {!allPrereqsMet && showPrereqDetails && (
          <div className="mt-4 pt-3 border-t border-cream/10 grid grid-cols-1 md:grid-cols-2 gap-3">
            {!status.hasApiKey && (
              <div className="bg-cream/5 border border-cream/10 rounded px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="h-3.5 w-3.5 text-cream/50" />
                  <span className="font-heading text-[11px] text-cream/80 uppercase tracking-wide">
                    Notion API Key
                  </span>
                </div>
                <p className="text-[10px] font-body text-cream/45 mb-2">
                  Add to your <code className="text-amber-glow/70">.env</code>{" "}
                  file:
                </p>
                <div className="bg-black/20 rounded px-3 py-2">
                  <code className="text-[10px] font-mono text-amber-glow/60">
                    NOTION_API_KEY=ntn_...
                  </code>
                </div>
              </div>
            )}
            {!status.mcpBuilt && (
              <div className="bg-cream/5 border border-cream/10 rounded px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-3.5 w-3.5 text-cream/50" />
                  <span className="font-heading text-[11px] text-cream/80 uppercase tracking-wide">
                    MCP Server
                  </span>
                </div>
                <p className="text-[10px] font-body text-cream/45 mb-2">
                  Build the server:
                </p>
                <div className="bg-black/20 rounded px-3 py-2">
                  <code className="text-[10px] font-mono text-amber-glow/60">
                    npm run setup:mcp
                  </code>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Database Grid ═══ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-wood-light/30" />
          <h3 className="font-heading font-bold text-[11px] text-smoke/60 uppercase tracking-[0.2em] whitespace-nowrap">
            CRM Databases
          </h3>
          <div className="h-px flex-1 bg-wood-light/30" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {status.databases.map((db, i) => (
            <DatabaseStatusCard
              key={db.key}
              dbKey={db.key}
              name={db.name}
              id={db.id}
              accessible={db.accessible}
              error={db.error}
              propertyCount={db.propertyCount}
              onRefresh={refresh}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* ═══ Claude Desktop Config ═══ */}
      <ConfigSnippet mcpServerPath={mcpPath} />
    </div>
  );
}
