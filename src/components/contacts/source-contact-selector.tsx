"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Download,
} from "lucide-react";

interface ConnectedSource {
  id: number;
  database_id: string;
  title: string;
  icon?: string;
  last_synced_at: number | null;
  contactCount: number;
}

interface PreviewRecord {
  page_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
}

interface SourceContactSelectorProps {
  source: ConnectedSource;
  onBack: () => void;
  onImportComplete: () => void;
}

export function SourceContactSelector({
  source,
  onBack,
  onImportComplete,
}: SourceContactSelectorProps) {
  const [records, setRecords] = useState<PreviewRecord[]>([]);
  const [alreadyImported, setAlreadyImported] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count: number;
  } | null>(null);

  useEffect(() => {
    fetchPreview();
  }, [source.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/notion/connect/${source.id}/preview`);
      const data = await response.json();
      setRecords(data.records || []);
      setAlreadyImported(new Set(data.alreadyImported || []));
    } catch (error) {
      console.error("Failed to fetch preview:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.email?.toLowerCase().includes(term) ||
        r.company?.toLowerCase().includes(term)
    );
  }, [records, searchTerm]);

  // Separate new and already-imported
  const newRecords = useMemo(
    () => filteredRecords.filter((r) => !alreadyImported.has(r.page_id)),
    [filteredRecords, alreadyImported]
  );
  const importedRecords = useMemo(
    () => filteredRecords.filter((r) => alreadyImported.has(r.page_id)),
    [filteredRecords, alreadyImported]
  );

  const toggleSelect = (pageId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pageId)) {
        next.delete(pageId);
      } else {
        next.add(pageId);
      }
      return next;
    });
  };

  const selectAllNew = () => {
    setSelectedIds(new Set(newRecords.map((r) => r.page_id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) return;
    setImporting(true);

    try {
      const response = await fetch(
        `/api/notion/connect/${source.id}/import-selected`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page_ids: Array.from(selectedIds) }),
        }
      );

      const data = await response.json();
      setImportResult({
        success: response.ok,
        count: data.importedCount || 0,
      });

      if (response.ok) {
        // Mark newly imported as already imported
        setAlreadyImported((prev) => {
          const next = new Set(prev);
          selectedIds.forEach((id) => next.add(id));
          return next;
        });
        setSelectedIds(new Set());
        onImportComplete();
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({ success: false, count: 0 });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin text-wood-dark/40 mx-auto" />
          <p className="text-sm text-wood-dark">
            Loading contacts from {source.title}...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1 -ml-2"
        >
          <ArrowLeft className="h-4 w-4" />
          All Sources
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPreview}
          className="gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh from Notion
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-dark/50" />
        <Input
          type="text"
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          {newRecords.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllNew}
              className="text-xs"
            >
              Select All New ({newRecords.length})
            </Button>
          )}
          {selectedIds.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              className="text-xs"
            >
              Deselect All
            </Button>
          )}
        </div>
        <p className="text-xs text-wood-dark">
          {records.length} total • {newRecords.length} new •{" "}
          {importedRecords.length} already imported
        </p>
      </div>

      {/* Import success banner */}
      {importResult?.success && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-3 mb-3">
          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
          <p className="text-sm text-green-800">
            Successfully imported {importResult.count} contact
            {importResult.count !== 1 ? "s" : ""}!
          </p>
        </div>
      )}

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto max-h-[50vh] rounded-lg border-2 border-wood-light">
        {/* New contacts section */}
        {newRecords.length > 0 && (
          <>
            <div className="px-3 py-2 bg-amber/10 border-b border-wood-light">
              <p className="text-xs font-semibold text-wood-darkest uppercase tracking-wider">
                New Contacts
              </p>
            </div>
            {newRecords.map((record) => (
              <ContactRow
                key={record.page_id}
                record={record}
                selected={selectedIds.has(record.page_id)}
                imported={false}
                onToggle={() => toggleSelect(record.page_id)}
              />
            ))}
          </>
        )}

        {/* Already imported section */}
        {importedRecords.length > 0 && (
          <>
            <div className="px-3 py-2 bg-wood/5 border-b border-t border-wood-light">
              <p className="text-xs font-semibold text-wood-dark uppercase tracking-wider">
                Already Imported
              </p>
            </div>
            {importedRecords.map((record) => (
              <ContactRow
                key={record.page_id}
                record={record}
                selected={selectedIds.has(record.page_id)}
                imported={true}
                onToggle={() => toggleSelect(record.page_id)}
              />
            ))}
          </>
        )}

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center text-sm text-wood-dark">
            {searchTerm
              ? "No contacts match your search"
              : "No contacts found in this source"}
          </div>
        )}
      </div>

      {/* Sticky footer */}
      <div className="flex items-center justify-between pt-4 border-t border-wood-light mt-3">
        <p className="text-sm text-wood-dark">
          {selectedIds.size > 0 ? (
            <>
              <span className="font-semibold text-wood-darkest">
                {selectedIds.size}
              </span>{" "}
              contact{selectedIds.size !== 1 ? "s" : ""} selected
            </>
          ) : (
            "Select contacts to import"
          )}
        </p>
        <Button
          onClick={handleImport}
          disabled={selectedIds.size === 0 || importing}
          className="gap-2"
        >
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Import Selected
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ContactRow({
  record,
  selected,
  imported,
  onToggle,
}: {
  record: PreviewRecord;
  selected: boolean;
  imported: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 border-b border-wood-light/50 hover:bg-amber/5 cursor-pointer ${
        imported ? "opacity-60" : ""
      } ${selected ? "bg-amber/10" : ""}`}
      onClick={onToggle}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={() => onToggle()}
        onClick={(e) => e.stopPropagation()}
        aria-label={`Select ${record.name}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-medium truncate ${
              imported ? "text-wood-dark" : "text-wood-darkest"
            }`}
          >
            {record.name}
          </p>
          {imported && (
            <Badge variant="secondary" className="text-[10px] shrink-0">
              Already imported
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {record.email && (
            <span className="text-xs text-wood-dark truncate">
              {record.email}
            </span>
          )}
          {record.company && (
            <span className="text-xs text-wood-dark truncate">
              {record.company}
            </span>
          )}
          {record.phone && (
            <span className="text-xs text-wood-dark font-mono">
              {record.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
