"use client";

import { useState, useCallback } from "react";
import { CRMSchema } from "@/lib/schema/types";

export interface ProgressEvent {
  step: number;
  totalSteps: number;
  phase: "creating_parent" | "creating_databases" | "adding_relations" | "complete" | "error";
  message: string;
  detail?: string;
  databaseName?: string;
  status: "pending" | "in_progress" | "success" | "error";
  error?: string;
}

type CreationStatus = "idle" | "creating" | "complete" | "error";

export function useCreationStream() {
  const [steps, setSteps] = useState<ProgressEvent[]>([]);
  const [status, setStatus] = useState<CreationStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const startCreation = useCallback(async (schema: CRMSchema, pageTitle: string, parentPageId?: string) => {
    setStatus("creating");
    setSteps([]);
    setError(null);

    try {
      const response = await fetch("/api/crm/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema, pageTitle, parentPageId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event: ProgressEvent = JSON.parse(line.slice(6));
              setSteps((prev) => [...prev, event]);

              if (event.phase === "complete") {
                setStatus("complete");
              } else if (event.phase === "error") {
                setStatus("error");
                setError(event.error || "Unknown error");
              }
            } catch (e) {
              console.error("Failed to parse SSE event:", e);
            }
          }
        }
      }
    } catch (err: any) {
      console.error("Stream error:", err);
      setStatus("error");
      setError(err.message || "Failed to create CRM");
    }
  }, []);

  const reset = useCallback(() => {
    setSteps([]);
    setStatus("idle");
    setError(null);
  }, []);

  return {
    steps,
    status,
    error,
    startCreation,
    reset,
  };
}
