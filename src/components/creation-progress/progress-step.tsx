"use client";

import { ProgressEvent } from "./use-creation-stream";
import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";

interface ProgressStepProps {
  event: ProgressEvent;
}

export function ProgressStep({ event }: ProgressStepProps) {
  const getIcon = () => {
    switch (event.status) {
      case "in_progress":
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTextColor = () => {
    switch (event.status) {
      case "success":
        return "text-foreground";
      case "error":
        return "text-destructive";
      case "in_progress":
        return "text-primary font-medium";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${getTextColor()}`}>{event.message}</p>
        {event.detail && (
          <p className="text-xs text-muted-foreground mt-0.5">{event.detail}</p>
        )}
        {event.error && (
          <p className="text-xs text-destructive mt-1">{event.error}</p>
        )}
      </div>
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {event.step}/{event.totalSteps}
      </div>
    </div>
  );
}
