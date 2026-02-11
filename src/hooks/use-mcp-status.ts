"use client";

import { useState, useEffect, useCallback } from "react";

interface DatabaseStatus {
  key: string;
  name: string;
  id: string | null;
  accessible: boolean;
  error: string | null;
  propertyCount: number;
}

interface McpStatus {
  hasApiKey: boolean;
  schemaPresent: boolean;
  mcpBuilt: boolean;
  databases: DatabaseStatus[];
  allConnected: boolean;
  someConnected: boolean;
  connectedCount: number;
  totalCount: number;
}

export function useMcpStatus() {
  const [status, setStatus] = useState<McpStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mcp/status");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, loading, error, refresh };
}
