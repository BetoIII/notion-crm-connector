"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, MessageSquare, User, Phone } from "lucide-react";
import { replaceVariables, validateVariables } from "@/lib/templates/parser";
import type { MessageTemplate, ContactRecord } from "@/lib/templates/types";

interface MessagePreviewExampleProps {
  template: MessageTemplate;
  contact: ContactRecord;
}

export function MessagePreviewExample({
  template,
  contact,
}: MessagePreviewExampleProps) {
  const [previewMessage, setPreviewMessage] = useState("");
  const [missingVars, setMissingVars] = useState<string[]>([]);

  useEffect(() => {
    if (template && contact) {
      const message = replaceVariables(template.content, contact);
      const missing = validateVariables(template.content, contact);

      setPreviewMessage(message);
      setMissingVars(missing);
    }
  }, [template, contact]);

  if (!contact.phone) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <div>
            <h4 className="text-sm font-semibold text-destructive">No Phone Number</h4>
            <p className="mt-1 text-sm text-destructive/80">
              The selected contact doesn't have a phone number. Please select a different contact.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
          Message Example
        </h3>
        <Badge variant="outline" className="text-xs">
          First Contact
        </Badge>
      </div>

      {/* Contact Info */}
      <div className="rounded-lg border border-border/60 bg-card/50 p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-sm font-semibold">
              {contact.contact_name || "Unknown Contact"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{contact.phone}</span>
          </div>
        </div>
      </div>

      {/* Missing Variables Warning */}
      {missingVars.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-amber-600">
                Missing template variables
              </p>
              <p className="mt-1 text-xs text-amber-600/80">
                {missingVars.map((v) => `{{${v}}}`).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message Preview */}
      <div className="rounded-lg border border-border/60 bg-card shadow-sm">
        <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold text-foreground/90">
              How it will look
            </h4>
          </div>
        </div>

        <div className="p-4">
          {/* Message Bubble - iOS style */}
          <div className="flex justify-end">
            <div className="max-w-[85%] rounded-[18px] bg-blue-500 px-4 py-2.5 shadow-sm">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white">
                {previewMessage}
              </p>
            </div>
          </div>

          <p className="mt-3 text-xs text-muted-foreground/70 text-center">
            Preview of message to {contact.contact_name || contact.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
