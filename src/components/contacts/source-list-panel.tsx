"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Database,
  RefreshCw,
  Loader2,
  ChevronRight,
  Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";

interface ConnectedSource {
  id: number;
  database_id: string;
  title: string;
  icon?: string;
  last_synced_at: number | null;
  contactCount: number;
}

interface SourceListPanelProps {
  onSelectSource: (source: ConnectedSource) => void;
}

export function SourceListPanel({ onSelectSource }: SourceListPanelProps) {
  const [sources, setSources] = useState<ConnectedSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notion/connect");
      const data = await response.json();
      setSources(data || []);
    } catch (error) {
      console.error("Failed to fetch connected sources:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-wood-dark/40 mx-auto" />
          <p className="text-sm text-wood-dark">Loading connected sources...</p>
        </div>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Database className="h-16 w-16 text-wood-dark/20" />
        <div className="text-center">
          <p className="font-semibold text-wood-darkest">
            No sources connected yet
          </p>
          <p className="text-sm text-wood-dark mt-1">
            Connect a Notion database or import a CSV to get started
          </p>
        </div>
        <Link href="/dashboard/notion-connect">
          <Button variant="outline" className="gap-2">
            <LinkIcon className="h-4 w-4" />
            Connect Notion Database
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 py-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-wood-dark">
          {sources.length} connected source{sources.length !== 1 ? "s" : ""}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSources}
          className="gap-1 text-xs"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {sources.map((source) => (
        <button
          key={source.id}
          onClick={() => onSelectSource(source)}
          className="w-full flex items-center justify-between rounded-lg border-2 border-wood-light bg-cream p-4 hover:bg-amber/5 hover:border-wood transition-colors text-left group"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {source.icon ? (
              <span className="text-2xl">{source.icon}</span>
            ) : (
              <Database className="h-6 w-6 text-wood-dark" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-wood-darkest truncate">
                  {source.title}
                </p>
                <Badge variant="outline" className="text-xs shrink-0">
                  {source.contactCount} contacts
                </Badge>
              </div>
              {source.last_synced_at && (
                <p className="text-xs text-wood-dark mt-1">
                  Last synced:{" "}
                  {new Date(source.last_synced_at * 1000).toLocaleString()}
                </p>
              )}
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-wood-dark/40 group-hover:text-wood-dark shrink-0 ml-2" />
        </button>
      ))}
    </div>
  );
}
