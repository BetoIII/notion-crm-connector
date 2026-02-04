"use client";

import { useCreationStream } from "./use-creation-stream";
import { ProgressStep } from "./progress-step";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

interface ProgressPanelProps {
  onComplete?: () => void;
  onError?: () => void;
}

export function ProgressPanel({ onComplete, onError }: ProgressPanelProps) {
  const { steps, status, error, reset } = useCreationStream();

  const isComplete = status === "complete";
  const hasError = status === "error";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {isComplete
            ? "CRM Created Successfully!"
            : hasError
            ? "Creation Failed"
            : "Creating Your CRM"}
        </h2>
        <p className="text-muted-foreground">
          {isComplete
            ? "Your databases are ready in Notion"
            : hasError
            ? "Something went wrong during creation"
            : "Please wait while we set up your databases..."}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="space-y-1">
          {steps.map((step, index) => (
            <ProgressStep key={index} event={step} />
          ))}
        </div>

        {steps.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            Initializing...
          </p>
        )}
      </div>

      {/* Success State */}
      {isComplete && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/10 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="font-semibold mb-2">All Done!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your CRM databases have been created in your Notion workspace.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={reset}>
              Create Another CRM
            </Button>
            <Button asChild>
              <a
                href="https://notion.so"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in Notion
              </a>
            </Button>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Creation Failed</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error || "An unknown error occurred"}
          </p>
          <Button variant="outline" onClick={reset}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
