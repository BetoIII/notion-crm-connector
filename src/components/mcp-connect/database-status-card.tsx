"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Minus, Database, ExternalLink, Loader2 } from "lucide-react";

interface DatabaseStatusCardProps {
  dbKey: string;
  name: string;
  id: string | null;
  accessible: boolean;
  error: string | null;
  propertyCount: number;
  onRefresh?: () => void;
}

const DB_ICONS: Record<string, string> = {
  contacts: "👤",
  accounts: "🏢",
  opportunities: "💰",
  activities: "📋",
};

function notionUrl(id: string): string {
  return `https://notion.so/${id.replace(/-/g, "")}`;
}

export function DatabaseStatusCard({
  dbKey,
  name,
  id,
  accessible,
  error,
  propertyCount,
  onRefresh,
}: DatabaseStatusCardProps) {
  const isNotConfigured = !id && (error?.includes("Not yet configured") || error?.includes("Not found in schema"));
  const emoji = DB_ICONS[dbKey] || "📁";

  const [inputUrl, setInputUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleConnect() {
    if (!inputUrl.trim()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/mcp/schema/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: dbKey, notionUrl: inputUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to connect");
        return;
      }
      setInputUrl("");
      onRefresh?.();
    } catch {
      setSubmitError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const isClickable = accessible && id;

  const card = (
    <div
      className={`texture-paper card-paper rounded-sm p-5 relative overflow-hidden group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
        isClickable ? "cursor-pointer" : ""
      }`}
      style={{
        transform: `rotate(${dbKey === "contacts" || dbKey === "opportunities" ? -0.3 : 0.3}deg)`,
      }}
      onClick={isClickable ? () => window.open(notionUrl(id), "_blank", "noopener") : undefined}
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
            {isClickable && (
              <ExternalLink className="h-3.5 w-3.5 text-smoke opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
            )}
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
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => { setInputUrl(e.target.value); setSubmitError(null); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleConnect(); }}
                  placeholder="Paste Notion URL or database ID"
                  disabled={submitting}
                  className="flex-1 min-w-0 rounded border border-wood-light/50 bg-cream/80 px-2.5 py-1.5 text-[11px] font-mono text-charcoal placeholder:text-tan/60 focus:outline-none focus:ring-1 focus:ring-amber-dim/50 focus:border-amber-dim/50 disabled:opacity-50"
                />
                <button
                  onClick={handleConnect}
                  disabled={submitting || !inputUrl.trim()}
                  className="rounded bg-olive/90 px-3 py-1.5 text-[11px] font-heading font-bold text-cream uppercase tracking-wide hover:bg-olive transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  {submitting ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Link"
                  )}
                </button>
              </div>
              {submitError && (
                <p className="text-[10px] font-body text-burnt-orange mt-1.5">{submitError}</p>
              )}
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
    </div>
  );

  return card;
}
