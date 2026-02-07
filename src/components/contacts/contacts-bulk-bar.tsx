"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ContactsBulkBarProps {
  selectedCount: number;
  selectedIds: number[];
  onDelete: () => void;
  onClear: () => void;
}

export function ContactsBulkBar({
  selectedCount,
  selectedIds,
  onDelete,
  onClear,
}: ContactsBulkBarProps) {
  const router = useRouter();

  const handleSendSMS = () => {
    // Navigate to Send SMS tab with pre-selected contacts
    const params = new URLSearchParams();
    params.set("tab", "send-sms");
    params.set("contactIds", selectedIds.join(","));
    router.push(`/dashboard?${params}`);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="rounded-lg border-4 border-wood-dark bg-amber shadow-xl texture-paper">
        <div className="flex items-center gap-4 px-6 py-4">
          <p className="font-bold text-wood-darkest">
            {selectedCount} contact{selectedCount !== 1 ? "s" : ""} selected
          </p>

          <div className="h-6 w-px bg-wood-dark/30" />

          <div className="flex gap-2">
            <Button onClick={handleSendSMS} size="sm" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Send SMS
            </Button>

            <Button variant="outline" size="sm" className="gap-2" disabled>
              <Mail className="h-4 w-4" />
              Send Email
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={onDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>

          <div className="h-6 w-px bg-wood-dark/30" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
