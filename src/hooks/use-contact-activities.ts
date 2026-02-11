"use client";

import { useState, useEffect, useCallback } from "react";

interface Activity {
  id: number;
  contact_id: number;
  notion_activity_id: string | null;
  type: string;
  description: string;
  notes: string | null;
  status: string;
  activity_date: number;
  synced_to_notion: number;
  created_at: number;
  updated_at: number;
}

export function useContactActivities(contactId: number | null) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!contactId) return;
    setLoading(true);
    setError(null);
    try {
      // Trigger sync for this contact first
      await fetch("/api/activities/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact_ids: [contactId] }),
      }).catch(() => {}); // Sync failure is non-blocking

      // Fetch cached activities
      const res = await fetch(`/api/activities/${contactId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setActivities(data.activities || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load activities");
    } finally {
      setLoading(false);
    }
  }, [contactId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { activities, loading, error, refresh };
}
