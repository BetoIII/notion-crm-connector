"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SourceListPanel } from "./source-list-panel";
import { SourceContactSelector } from "./source-contact-selector";

interface ConnectedSource {
  id: number;
  database_id: string;
  title: string;
  icon?: string;
  last_synced_at: number | null;
  contactCount: number;
}

interface ImportFromSourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function ImportFromSourceModal({
  open,
  onOpenChange,
  onImportComplete,
}: ImportFromSourceModalProps) {
  const [selectedSource, setSelectedSource] = useState<ConnectedSource | null>(
    null
  );

  const handleClose = useCallback(
    (openState: boolean) => {
      if (!openState) {
        setSelectedSource(null);
      }
      onOpenChange(openState);
    },
    [onOpenChange]
  );

  const handleImportComplete = useCallback(() => {
    onImportComplete();
    setSelectedSource(null);
  }, [onImportComplete]);

  const handleBack = useCallback(() => {
    setSelectedSource(null);
  }, []);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-wood-darkest">
            {selectedSource
              ? `Import from ${selectedSource.title}`
              : "Import from Source"}
          </DialogTitle>
          <DialogDescription>
            {selectedSource
              ? "Select contacts to import into your database"
              : "Choose a connected source to browse and import contacts"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {!selectedSource ? (
            <SourceListPanel onSelectSource={setSelectedSource} />
          ) : (
            <SourceContactSelector
              source={selectedSource}
              onBack={handleBack}
              onImportComplete={handleImportComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
