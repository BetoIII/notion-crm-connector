"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Check, Loader2 } from "lucide-react";

interface NotionDatabase {
  id: string;
  title: string;
  icon?: {
    type: string;
    emoji?: string;
  };
  last_edited_time?: string;
  properties?: any;
}

interface ConnectedDatabase {
  database_id: string;
  title: string;
  last_synced_at: number | null;
  contactCount: number;
}

interface DatabasePickerProps {
  onSelectDatabase: (database: {
    id: string;
    title: string;
    icon?: string;
    properties: any[];
    sampleRecord?: any;
  }) => void;
}

export function DatabasePicker({ onSelectDatabase }: DatabasePickerProps) {
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [connectedDatabases, setConnectedDatabases] = useState<ConnectedDatabase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDatabases();
    fetchConnectedDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      const response = await fetch("/api/notion/databases");
      const data = await response.json();
      setDatabases(data.databases || []);
    } catch (error) {
      console.error("Failed to fetch databases:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedDatabases = async () => {
    try {
      const response = await fetch("/api/notion/connect");
      const data = await response.json();
      setConnectedDatabases(data || []);
    } catch (error) {
      console.error("Failed to fetch connected databases:", error);
    }
  };

  const isConnected = (databaseId: string) => {
    return connectedDatabases.some((db) => db.database_id === databaseId);
  };

  const handleSelectDatabase = async (database: NotionDatabase) => {
    // Fetch database schema and sample record (raw format for preview)
    try {
      const [schemaResponse, recordsResponse] = await Promise.all([
        fetch(`/api/notion/database-schema?databaseId=${database.id}`),
        fetch(`/api/notion/databases/${database.id}/records?raw=true&limit=1`),
      ]);

      const schema = await schemaResponse.json();
      const recordsData = await recordsResponse.json();
      const sampleRecord = recordsData.records?.[0] || null;

      onSelectDatabase({
        id: database.id,
        title: database.title,
        icon: database.icon?.emoji,
        properties: schema.properties || [],
        sampleRecord,
      });
    } catch (error) {
      console.error("Failed to fetch database schema:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-wood-dark" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-bold text-wood-darkest mb-2">
          Select a Notion Database
        </h3>
        <p className="text-sm text-wood-dark">
          Choose a database to import contacts from
        </p>
      </div>

      {databases.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-wood-dark/30 bg-cream p-8 text-center">
          <Database className="mx-auto mb-3 h-12 w-12 text-wood-dark/50" />
          <p className="text-wood-dark">No databases found in your Notion workspace.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {databases.map((database) => {
            const connected = isConnected(database.id);
            return (
              <button
                key={database.id}
                onClick={() => !connected && handleSelectDatabase(database)}
                disabled={connected}
                className={`group relative rounded-lg border-4 border-wood-dark bg-cream p-4 text-left transition-all hover:border-amber hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed texture-paper ${
                  connected ? "" : "hover:bg-amber/10"
                }`}
              >
                {connected && (
                  <Badge className="absolute right-3 top-3 gap-1 bg-green-600">
                    <Check className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
                <div className="flex items-start gap-3">
                  {database.icon?.emoji && (
                    <span className="text-3xl">{database.icon.emoji}</span>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-wood-darkest">{database.title}</h4>
                    {database.last_edited_time && (
                      <p className="mt-1 text-xs text-wood-dark">
                        Last edited:{" "}
                        {new Date(database.last_edited_time).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
