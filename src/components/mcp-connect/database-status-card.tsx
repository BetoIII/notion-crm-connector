"use client";

import { CheckCircle2, XCircle, Minus, Database, Terminal } from "lucide-react";

interface DatabaseStatusCardProps {
  dbKey: string;
  name: string;
  id: string | null;
  accessible: boolean;
  error: string | null;
  propertyCount: number;
}

const DB_ICONS: Record<string, string> = {
  contacts: "👤",
  accounts: "🏢",
  opportunities: "💰",
  activities: "📋",
};

export function DatabaseStatusCard({
  dbKey,
  name,
  id,
  accessible,
  error,
  propertyCount,
}: DatabaseStatusCardProps) {
  const isNotConfigured = error?.includes("Not yet configured");
  const emoji = DB_ICONS[dbKey] || "📁";

  return (
    <div
      className="texture-paper card-paper rounded-sm p-5 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{
        transform: `rotate(${dbKey === "contacts" || dbKey === "opportunities" ? -0.3 : 0.3}deg)`,
      }}
    >
      {/* Index card top stripe */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          accessible
            ? "bg-olive"
            : isNotConfigured
              ? "bg-tan"
              : "bg-burnt-orange"
        }`}
      />

      <div className="flex items-start gap-3 mt-1">
        {/* Status indicator */}
        <div
          className={`mt-0.5 flex-shrink-0 rounded-full p-1 ${
            accessible
              ? "bg-olive/15"
              : isNotConfigured
                ? "bg-tan/20"
                : "bg-burnt-orange/15"
          }`}
        >
          {accessible ? (
            <CheckCircle2 className="h-5 w-5 text-olive" />
          ) : isNotConfigured ? (
            <Minus className="h-5 w-5 text-tan" />
          ) : (
            <XCircle className="h-5 w-5 text-burnt-orange" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Database name */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg" role="img" aria-label={dbKey}>
              {emoji}
            </span>
            <h4 className="font-heading font-bold text-sm text-charcoal truncate uppercase tracking-wide">
              {dbKey}
            </h4>
          </div>

          {/* Full name */}
          <p className="text-xs font-body text-smoke truncate mb-2">{name}</p>

          {/* Status details */}
          {accessible ? (
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-body text-smoke">
                <Database className="h-3 w-3 text-olive" />
                <span>{propertyCount} properties</span>
              </div>
              {id && (
                <p
                  className="text-[10px] font-mono text-tan truncate"
                  title={id}
                >
                  {id.substring(0, 8)}...{id.substring(id.length - 4)}
                </p>
              )}
            </div>
          ) : isNotConfigured ? (
            <div className="mt-2 rounded bg-tan/10 border border-tan/30 px-3 py-2">
              <div className="flex items-start gap-1.5">
                <Terminal className="h-3 w-3 text-smoke mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-body text-smoke leading-snug">
                  Run{" "}
                  <code className="font-mono text-amber-dim font-semibold">
                    setup_activities_database
                  </code>{" "}
                  via Claude
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-2 rounded bg-burnt-orange/5 border border-burnt-orange/20 px-3 py-2">
              <p className="text-[11px] font-body text-burnt-orange leading-snug truncate">
                {error || "Connection failed"}
              </p>
              {id && (
                <p
                  className="text-[10px] font-mono text-tan truncate mt-1"
                  title={id}
                >
                  {id.substring(0, 8)}...{id.substring(id.length - 4)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Index card ruled line at bottom */}
      <div className="absolute bottom-3 left-5 right-5 border-b border-wood-light/30" />
    </div>
  );
}
