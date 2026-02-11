"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useContactActivities } from "@/hooks/use-contact-activities";
import {
  Pencil,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  FileText,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  Inbox,
} from "lucide-react";
import type { Contact } from "@/lib/templates/types";

interface ContactDetailModalProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (contact: Contact) => void;
}

const ACTIVITY_TYPE_CONFIG: Record<
  string,
  { icon: typeof MessageSquare; colorClass: string; label: string }
> = {
  SMS: { icon: MessageSquare, colorClass: "text-amber-dim bg-amber-glow/10", label: "SMS" },
  Call: { icon: Phone, colorClass: "text-olive bg-olive/10", label: "Call" },
  Email: { icon: Mail, colorClass: "text-burnt-orange bg-burnt-orange/10", label: "Email" },
  Note: { icon: FileText, colorClass: "text-smoke bg-tan/20", label: "Note" },
  Meeting: { icon: Calendar, colorClass: "text-wood-medium bg-wood-light/20", label: "Meeting" },
  Task: { icon: FileText, colorClass: "text-charcoal bg-tan/10", label: "Task" },
};

function formatActivityDate(unixTimestamp: number): string {
  const date = new Date(unixTimestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function ActivityItem({
  activity,
}: {
  activity: {
    id: number;
    type: string;
    description: string;
    notes: string | null;
    activity_date: number;
    synced_to_notion: number;
  };
}) {
  const [expanded, setExpanded] = useState(false);
  const config = ACTIVITY_TYPE_CONFIG[activity.type] || ACTIVITY_TYPE_CONFIG.Note;
  const Icon = config.icon;

  return (
    <div className="relative pl-8 pb-6 last:pb-0 group">
      {/* Timeline connector */}
      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-wood-light/50 group-last:hidden" />

      {/* Timeline node */}
      <div
        className={`absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full ${config.colorClass} ring-2 ring-cream`}
      >
        <Icon className="h-3 w-3" />
      </div>

      {/* Card */}
      <div className="texture-paper rounded border border-wood-light/40 p-3 transition-all hover:shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-body font-semibold text-charcoal leading-snug">
              {activity.description}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-body text-smoke">
                {formatActivityDate(activity.activity_date)}
              </span>
              <span className="text-[10px] font-body text-tan uppercase tracking-wider">
                {config.label}
              </span>
              {activity.synced_to_notion === 1 && (
                <span className="text-[10px] font-body text-olive" title="Synced to Notion">
                  synced
                </span>
              )}
            </div>
          </div>

          {activity.notes && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-shrink-0 p-0.5 rounded hover:bg-tan/20 text-smoke transition-colors"
            >
              {expanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>

        {expanded && activity.notes && (
          <div className="mt-2 pt-2 border-t border-wood-light/30">
            <p className="text-xs font-body text-smoke leading-relaxed whitespace-pre-wrap">
              {activity.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ContactDetailModal({
  contact,
  open,
  onOpenChange,
  onEdit,
}: ContactDetailModalProps) {
  const { activities, loading } = useContactActivities(
    open && contact ? contact.id : null
  );

  if (!contact) return null;

  const displayName =
    contact.name ||
    `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
    "Unknown Contact";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden p-0 gap-0">
        {/* File folder tab at top */}
        <div className="absolute -top-3 left-6 z-10">
          <div className="texture-wood border-2 border-b-0 border-wood-dark rounded-t px-4 py-1">
            <span className="text-[10px] font-heading font-bold uppercase tracking-widest text-cream text-embossed">
              Personnel File
            </span>
          </div>
        </div>

        {/* Header — wood panel */}
        <div className="texture-wood border-b-4 border-wood-dark px-6 py-5 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-2xl font-heading font-bold text-cream text-embossed truncate">
                {displayName}
              </DialogTitle>
              {(contact.title || contact.company) && (
                <p className="text-cream/70 text-sm font-body mt-1 truncate">
                  {[contact.title, contact.company].filter(Boolean).join(" at ")}
                </p>
              )}
            </div>
            <Button
              onClick={() => onEdit(contact)}
              variant="ghost"
              size="sm"
              className="text-cream/70 hover:text-cream hover:bg-cream/10 flex-shrink-0 ml-4"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Edit</span>
            </Button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-6 space-y-5">
          {/* Contact Info Card */}
          <div className="texture-paper card-paper rounded p-5">
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-smoke mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-wood-light" />
              Contact Information
              <span className="flex-1 h-px bg-wood-light/30" />
            </h3>

            <div className="grid grid-cols-2 gap-4">
              {/* Phone */}
              <div className="flex items-center gap-2.5">
                <div className="rounded bg-olive/10 p-1.5">
                  <Phone className="h-3.5 w-3.5 text-olive" />
                </div>
                <div>
                  <p className="text-[10px] font-body text-tan uppercase tracking-wider">
                    Phone
                  </p>
                  <p className="text-sm font-mono text-charcoal">
                    {contact.phone || "—"}
                  </p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-2.5">
                <div className="rounded bg-burnt-orange/10 p-1.5">
                  <Mail className="h-3.5 w-3.5 text-burnt-orange" />
                </div>
                <div>
                  <p className="text-[10px] font-body text-tan uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-sm font-body text-charcoal truncate max-w-[180px]">
                    {contact.email || "—"}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2.5">
                <div className="rounded bg-wood-light/20 p-1.5">
                  <MapPin className="h-3.5 w-3.5 text-wood-medium" />
                </div>
                <div>
                  <p className="text-[10px] font-body text-tan uppercase tracking-wider">
                    Location
                  </p>
                  <p className="text-sm font-body text-charcoal">
                    {[contact.city, contact.state].filter(Boolean).join(", ") ||
                      "—"}
                  </p>
                </div>
              </div>

              {/* Source */}
              <div className="flex items-center gap-2.5">
                <div>
                  <p className="text-[10px] font-body text-tan uppercase tracking-wider mb-1">
                    Source
                  </p>
                  <Badge
                    variant={
                      contact.source === "notion" ? "default" : "secondary"
                    }
                    className="capitalize text-[10px] rotate-0"
                  >
                    {contact.source}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div>
            <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-smoke mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-wood-light" />
              Activity Timeline
              <span className="flex-1 h-px bg-wood-light/30" />
              {activities.length > 0 && (
                <span className="text-[10px] font-body text-tan normal-case tracking-normal">
                  {activities.length} activit{activities.length === 1 ? "y" : "ies"}
                </span>
              )}
            </h3>

            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-5 w-5 animate-spin text-wood-medium" />
                <span className="ml-2 text-sm font-body text-smoke">
                  Loading activities...
                </span>
              </div>
            ) : activities.length === 0 ? (
              <div className="texture-paper card-paper rounded p-8 text-center">
                <Inbox className="h-10 w-10 text-tan mx-auto mb-3" />
                <p className="font-heading font-bold text-sm text-charcoal mb-1">
                  No Activities Yet
                </p>
                <p className="text-xs font-body text-smoke">
                  Send an SMS or log activities via MCP
                </p>
              </div>
            ) : (
              <div className="relative">
                {activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
