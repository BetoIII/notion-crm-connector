"use client";

import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Database,
  ExternalLink,
  Loader2,
  Link2,
  Unlink,
} from "lucide-react";

interface DatabaseStatusCardProps {
  dbKey: string;
  name: string;
  id: string | null;
  accessible: boolean;
  error: string | null;
  propertyCount: number;
  onRefresh?: () => void;
  index?: number;
}

const DB_ICONS: Record<string, string> = {
  contacts: "\u{1F464}",
  accounts: "\u{1F3E2}",
  opportunities: "\u{1F4B0}",
  activities: "\u{1F4CB}",
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
  index = 0,
}: DatabaseStatusCardProps) {
  const isNotConfigured =
    !id &&
    (error?.includes("Not yet configured") ||
      error?.includes("Not found in schema"));
  const emoji = DB_ICONS[dbKey] || "\u{1F4C1}";

  const [inputUrl, setInputUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showRelink, setShowRelink] = useState(false);

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
      setShowRelink(false);
      onRefresh?.();
    } catch {
      setSubmitError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  const isClickable = accessible && id;

  const headerBg = accessible
    ? "bg-olive"
    : isNotConfigured
      ? "bg-wood-medium"
      : "bg-burnt-orange/90";

  const borderColor = accessible
    ? "border-olive/30 hover:border-olive/50"
    : isNotConfigured
      ? "border-wood-light/40"
      : "border-burnt-orange/25 hover:border-burnt-orange/40";

  return (
    <div
      className={`rounded-sm overflow-hidden transition-all duration-300 hover:-translate-y-1 group shadow-[2px_3px_8px_rgba(101,67,33,0.1)] hover:shadow-[3px_5px_16px_rgba(101,67,33,0.18)] border-2 ${borderColor}`}
      style={{
        animation: "card-slide-up 0.4s ease-out both",
        animationDelay: `${index * 100 + 150}ms`,
      }}
    >
      {/* ── File Folder Tab Header ── */}
      <div
        className={`${headerBg} px-4 py-2.5 flex items-center justify-between ${
          isClickable ? "cursor-pointer hover:brightness-110 transition-all" : ""
        }`}
        onClick={
          isClickable
            ? () => window.open(notionUrl(id), "_blank", "noopener")
            : undefined
        }
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base drop-shadow-sm" role="img" aria-label={dbKey}>
            {emoji}
          </span>
          <h4 className="font-heading font-bold text-xs text-cream uppercase tracking-wider text-embossed">
            {dbKey}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {accessible ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-cream/70" />
              {isClickable && (
                <ExternalLink className="h-3.5 w-3.5 text-cream/0 group-hover:text-cream/60 transition-all duration-200" />
              )}
            </>
          ) : isNotConfigured ? (
            <Unlink className="h-3.5 w-3.5 text-cream/40" />
          ) : (
            <XCircle className="h-4 w-4 text-cream/70" />
          )}
        </div>
      </div>

      {/* ── Card Body ── */}
      <div
        className={`texture-paper px-4 py-3.5 ${
          isClickable ? "cursor-pointer" : ""
        }`}
        onClick={
          isClickable
            ? () => window.open(notionUrl(id), "_blank", "noopener")
            : undefined
        }
      >
        {/* Display name */}
        <p className="text-[11px] font-body text-smoke/60 truncate mb-2">
          {name}
        </p>

        {accessible ? (
          /* ── Connected ── */
          <div className="space-y-1.5">
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
          /* ── Not Configured — URL input as primary ── */
          <div onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-body text-smoke/50 mb-2.5">
              Paste a Notion database URL or ID to connect
            </p>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => {
                  setInputUrl(e.target.value);
                  setSubmitError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleConnect();
                }}
                placeholder="https://notion.so/... or ID"
                disabled={submitting}
                className="flex-1 min-w-0 rounded border border-wood-light/50 bg-cream/60 px-2.5 py-1.5 text-[11px] font-mono text-charcoal placeholder:text-tan/40 focus:outline-none focus:ring-1 focus:ring-amber-dim/40 focus:border-amber-dim/40 disabled:opacity-50 transition-colors"
              />
              <button
                onClick={handleConnect}
                disabled={submitting || !inputUrl.trim()}
                className="rounded bg-wood-medium hover:bg-wood-dark px-3 py-1.5 text-[10px] font-heading font-bold text-cream uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {submitting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Link2 className="h-3 w-3" />
                    Link
                  </>
                )}
              </button>
            </div>
            {submitError && (
              <p className="text-[10px] font-body text-burnt-orange mt-1.5">
                {submitError}
              </p>
            )}
          </div>
        ) : (
          /* ── Error — show error + re-link option ── */
          <div onClick={(e) => e.stopPropagation()}>
            <div className="rounded bg-burnt-orange/5 border border-burnt-orange/15 px-2.5 py-2">
              <p
                className="text-[10px] font-body text-burnt-orange leading-snug line-clamp-2"
                title={error || undefined}
              >
                {error || "Connection failed"}
              </p>
              {id && (
                <p
                  className="text-[9px] font-mono text-tan/70 truncate mt-1"
                  title={id}
                >
                  ID: {id.substring(0, 8)}...{id.substring(id.length - 4)}
                </p>
              )}
            </div>

            {/* Re-link toggle */}
            <div className="mt-2">
              {!showRelink ? (
                <button
                  onClick={() => setShowRelink(true)}
                  className="flex items-center gap-1 text-[10px] font-body text-smoke/50 hover:text-smoke transition-colors group/relink"
                >
                  <Link2 className="h-3 w-3 group-hover/relink:text-amber-dim transition-colors" />
                  <span>Re-link database</span>
                </button>
              ) : (
                <div className="space-y-1.5">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={inputUrl}
                      onChange={(e) => {
                        setInputUrl(e.target.value);
                        setSubmitError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleConnect();
                      }}
                      placeholder="New Notion URL or ID..."
                      disabled={submitting}
                      className="flex-1 min-w-0 rounded border border-wood-light/50 bg-cream/60 px-2.5 py-1.5 text-[11px] font-mono text-charcoal placeholder:text-tan/40 focus:outline-none focus:ring-1 focus:ring-amber-dim/40 focus:border-amber-dim/40 disabled:opacity-50 transition-colors"
                    />
                    <button
                      onClick={handleConnect}
                      disabled={submitting || !inputUrl.trim()}
                      className="rounded bg-burnt-orange/80 hover:bg-burnt-orange px-3 py-1.5 text-[10px] font-heading font-bold text-cream uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {submitting ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <>
                          <Link2 className="h-3 w-3" />
                          Link
                        </>
                      )}
                    </button>
                  </div>
                  {submitError && (
                    <p className="text-[10px] font-body text-burnt-orange">
                      {submitError}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
