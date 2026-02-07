"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, User, Phone, AlertTriangle, MessageSquare } from "lucide-react";
import { replaceVariables, validateVariables } from "@/lib/templates/parser";
import type { MessageTemplate, ContactRecord } from "@/lib/templates/types";

interface MessagePreviewCarouselProps {
  template: MessageTemplate;
  contacts: ContactRecord[];
}

export function MessagePreviewCarousel({
  template,
  contacts,
}: MessagePreviewCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (contacts.length === 0) {
    return (
      <div className="texture-paper card-paper rounded-lg p-8 text-center">
        <User className="mx-auto mb-4 h-12 w-12 text-wood-medium/40" />
        <p className="text-sm text-smoke font-body">
          No contacts selected for preview
        </p>
      </div>
    );
  }

  const currentContact = contacts[currentIndex];
  const previewMessage = replaceVariables(template.content, currentContact);
  const missingVars = validateVariables(template.content, currentContact);

  const hasNext = currentIndex < contacts.length - 1;
  const hasPrev = currentIndex > 0;

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-wood-medium" />
          <h3 className="font-heading text-lg font-bold text-charcoal uppercase tracking-wider">
            Message Previews
          </h3>
        </div>

        <Badge variant="outline" className="text-xs font-body border-wood-light">
          {currentIndex + 1} of {contacts.length}
        </Badge>
      </div>

      {/* Contact Navigation */}
      {contacts.length > 1 && (
        <div className="flex items-center justify-between gap-4 texture-wood rounded-lg p-4 border-2 border-wood-dark">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={!hasPrev}
            className="text-cream hover:bg-cream/20 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 text-center">
            <p className="font-heading font-bold text-cream text-embossed text-sm">
              {currentContact.contact_name || "Unknown Contact"}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(contacts.length - 1, currentIndex + 1))}
            disabled={!hasNext}
            className="text-cream hover:bg-cream/20 disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Current Contact Info */}
      <div className="texture-paper card-paper rounded-lg p-5 space-y-3">
        <p className="text-xs font-heading uppercase tracking-wider text-smoke mb-3">
          Contact Information
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-wood-medium" />
              <div>
                <p className="text-xs text-smoke font-body">Name</p>
                <p className="text-sm font-body font-bold text-charcoal">
                  {currentContact.contact_name || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-wood-medium" />
              <div>
                <p className="text-xs text-smoke font-body">Phone</p>
                <p className="text-sm font-body font-bold text-charcoal">
                  {currentContact.phone || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {!currentContact.phone && (
        <div className="rounded-lg border-2 border-burnt-orange bg-burnt-orange/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-burnt-orange shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-burnt-orange font-heading">No Phone Number</p>
              <p className="text-xs text-burnt-orange/80 font-body mt-1">
                This contact cannot receive messages
              </p>
            </div>
          </div>
        </div>
      )}

      {missingVars.length > 0 && currentContact.phone && (
        <div className="rounded-lg border-2 border-amber-dim bg-amber-glow/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-dim shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-dim font-heading">Missing Data</p>
              <p className="text-xs text-amber-dim/80 font-body mt-1">
                Variables: {missingVars.map((v) => `{{${v}}}`).join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Message Preview - iMessage Style */}
      <div className="space-y-4">
        <div className="flex justify-end px-4">
          <div className="max-w-[85%] rounded-[20px] bg-blue-500 px-5 py-3.5 shadow-lg">
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white font-body">
              {previewMessage}
            </p>
          </div>
        </div>

        <div className="flex justify-end px-4">
          <p className="text-xs text-smoke/60 font-body italic">
            To: {currentContact.phone || "No phone number"}
          </p>
        </div>
      </div>

      {/* Character Count */}
      <div className="texture-paper card-paper rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-smoke font-body">Message Length</span>
          <span className="text-sm font-bold text-charcoal font-body">
            {previewMessage.length} characters
          </span>
        </div>
      </div>
    </div>
  );
}
