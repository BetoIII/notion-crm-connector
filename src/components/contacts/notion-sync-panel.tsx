"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Database, Loader2 } from "lucide-react";

interface ConnectedDatabase {
  id: number;
  database_id: string;
  title: string;
  icon?: string;
  last_synced_at: number | null;
  contactCount: number;
}

interface NotionSyncPanelProps {
  onSyncComplete: () => void;
}

export function NotionSyncPanel({ onSyncComplete }: NotionSyncPanelProps) {
  const [connectedDatabases, setConnectedDatabases] = useState<ConnectedDatabase[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<number | null>(null);

  useEffect(() => {
    fetchConnectedDatabases();
  }, []);

  const fetchConnectedDatabases = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notion/connect");
      const data = await response.json();
      setConnectedDatabases(data || []);
    } catch (error) {
      console.error("Failed to fetch connected databases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (connectionId: number) => {
    try {
      setSyncing(connectionId);
      const response = await fetch(`/api/notion/connect/${connectionId}/sync`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `Sync failed with status ${response.status}`);
      }

      const data = await response.json();

      // Refresh the connected databases list
      await fetchConnectedDatabases();

      // Notify parent to refresh contacts
      onSyncComplete();

      // Show success feedback
      alert(`Successfully synced ${data.syncedCount} contact(s)!`);
    } catch (error) {
      console.error("Failed to sync database:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sync contacts. Please try again.";
      alert(errorMessage);
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg border-2 border-wood-light bg-cream/50 p-4 texture-paper">
        <div className="flex items-center gap-2 text-sm text-wood-dark">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading connected databases...
        </div>
      </div>
    );
  }

  if (connectedDatabases.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border-2 border-wood-light bg-cream/50 p-4 texture-paper space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-wood-darkest flex items-center gap-2">
          <Database className="h-4 w-4" />
          Connected Notion Databases
        </h3>
      </div>

      <div className="space-y-2">
        {connectedDatabases.map((db) => (
          <div
            key={db.id}
            className="flex items-center justify-between rounded-lg border border-wood-light bg-cream p-3"
          >
            <div className="flex items-center gap-3 flex-1">
              {db.icon && <span className="text-xl">{db.icon}</span>}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-wood-darkest truncate">
                    {db.title}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {db.contactCount} contacts
                  </Badge>
                </div>
                {db.last_synced_at && (
                  <p className="text-xs text-wood-dark mt-1">
                    Last synced:{" "}
                    {new Date(db.last_synced_at * 1000).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <Button
              onClick={() => handleSync(db.id)}
              disabled={syncing === db.id}
              size="sm"
              variant="outline"
              className="gap-2 ml-3"
            >
              {syncing === db.id ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Sync
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
