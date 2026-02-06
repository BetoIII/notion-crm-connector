"use client";

import { ProgressStep } from "./progress-step";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { ProgressEvent } from "./use-creation-stream";

interface ProgressPanelProps {
  steps: ProgressEvent[];
  status: "idle" | "creating" | "complete" | "error";
  error: string | null;
  pageUrl?: string;
  onReset: () => void;
  onComplete?: () => void;
  onError?: () => void;
}

export function ProgressPanel({ steps, status, error, pageUrl, onReset, onComplete, onError }: ProgressPanelProps) {

  const isComplete = status === "complete";
  const hasError = status === "error";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold font-heading text-charcoal mb-2">
          {isComplete
            ? "CRM CREATED SUCCESSFULLY!"
            : hasError
            ? "CREATION FAILED"
            : "CREATING YOUR CRM"}
        </h2>
        <p className="font-body text-smoke">
          {isComplete
            ? "Your databases are ready in Notion"
            : hasError
            ? "Something went wrong during creation"
            : "Please wait while we set up your databases..."}
        </p>
      </div>

      {/* Progress Steps - Dot Matrix Printer Output Style */}
      <div className="rounded border-2 border-wood-light bg-cream texture-paper p-6 font-body text-sm">
        <div className="space-y-1 font-mono">
          {steps.map((step, index) => (
            <ProgressStep key={index} event={step} />
          ))}
        </div>

        {steps.length === 0 && (
          <p className="text-center text-smoke py-8 font-body">
            INITIALIZING...
          </p>
        )}
      </div>

      {/* Success State */}
      {isComplete && (
        <div className="rounded border-2 border-olive bg-olive/20 texture-paper p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-olive mx-auto mb-4" />
          <h3 className="font-bold font-heading text-charcoal mb-2">ALL DONE!</h3>
          <p className="text-sm font-body text-smoke mb-4">
            Your CRM databases have been created in your Notion workspace.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={onReset}>
              Create Another CRM
            </Button>
            {pageUrl && (
              <Button asChild>
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Notion
                </a>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="rounded border-2 border-destructive bg-destructive/20 texture-paper p-6 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="font-bold font-heading text-charcoal mb-2">CREATION FAILED</h3>
          <p className="text-sm font-body text-smoke mb-4">
            {error || "An unknown error occurred"}
          </p>
          <Button variant="outline" onClick={onReset}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
