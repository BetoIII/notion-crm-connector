"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowRight,
  ArrowLeft,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import Papa from "papaparse";

type Step = "upload" | "map" | "import";

const CONTACT_FIELDS = [
  { key: "name", label: "Full Name" },
  { key: "first_name", label: "First Name" },
  { key: "last_name", label: "Last Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "company", label: "Company" },
  { key: "title", label: "Title" },
  { key: "city", label: "City" },
  { key: "state", label: "State" },
] as const;

interface CSVImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete: () => void;
}

export function CSVImportModal({
  open,
  onOpenChange,
  onImportComplete,
}: CSVImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
  } | null>(null);
  const [importing, setImporting] = useState(false);

  const reset = useCallback(() => {
    setStep("upload");
    setCsvHeaders([]);
    setCsvRows([]);
    setPreviewRows([]);
    setFileName("");
    setMapping({});
    setImportResult(null);
    setImporting(false);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];

        setCsvHeaders(headers);
        setCsvRows(rows);
        setPreviewRows(rows.slice(0, 5));

        // Auto-suggest mappings
        const autoMapping: Record<string, string> = {};
        CONTACT_FIELDS.forEach((field) => {
          const match = headers.find((h) => {
            const hLower = h.toLowerCase().trim();
            const fLower = field.key.toLowerCase().replace("_", " ");
            const fLabel = field.label.toLowerCase();
            return hLower === fLower || hLower === fLabel || hLower.includes(fLower);
          });
          if (match) {
            autoMapping[field.key] = match;
          }
        });
        setMapping(autoMapping);
      },
    });
  };

  const handleMapping = (contactField: string, csvColumn: string) => {
    setMapping({
      ...mapping,
      [contactField]: csvColumn === "none" ? "" : csvColumn,
    });
  };

  const handleImport = async () => {
    setStep("import");
    setImporting(true);

    try {
      // Map CSV rows to contacts using the field mapping
      const contacts = csvRows.map((row) => {
        const contact: Record<string, string> = {};
        Object.entries(mapping).forEach(([contactField, csvColumn]) => {
          if (csvColumn && row[csvColumn]) {
            contact[contactField] = row[csvColumn];
          }
        });
        return contact;
      });

      // Filter out empty contacts
      const validContacts = contacts.filter((c) =>
        Object.values(c).some((v) => v && v.trim())
      );

      const response = await fetch("/api/contacts/import-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: validContacts }),
      });

      const data = await response.json();
      setImportResult({
        success: response.ok,
        importedCount: data.importedCount || 0,
      });
    } catch (error) {
      console.error("CSV import failed:", error);
      setImportResult({ success: false, importedCount: 0 });
    } finally {
      setImporting(false);
    }
  };

  const getSampleValue = (csvColumn: string | undefined): string => {
    if (!csvColumn || previewRows.length === 0) return "";
    return previewRows[0]?.[csvColumn] || "";
  };

  const handleClose = (openState: boolean) => {
    if (!openState) {
      if (importResult?.success) {
        onImportComplete();
      }
      reset();
    }
    onOpenChange(openState);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-wood-darkest">
            Import from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file and map columns to contact fields
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 py-2">
          {[
            { key: "upload", label: "Upload", num: 1 },
            { key: "map", label: "Map Fields", num: 2 },
            { key: "import", label: "Import", num: 3 },
          ].map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              {idx > 0 && <div className="h-px w-8 bg-wood-dark/30" />}
              <div
                className={`flex items-center gap-2 ${
                  step === s.key ? "opacity-100" : "opacity-50"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-sm font-bold ${
                    step === s.key
                      ? "border-wood-darkest bg-amber text-wood-darkest"
                      : "border-wood bg-cream text-wood-dark"
                  }`}
                >
                  {s.num}
                </div>
                <span className="text-sm font-semibold text-wood-darkest">
                  {s.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-wood-dark/30 bg-cream/50 p-12">
              {!fileName ? (
                <>
                  <Upload className="h-12 w-12 text-wood-dark/40 mb-4" />
                  <p className="text-wood-dark mb-4">
                    Select a CSV file to upload
                  </p>
                  <label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button asChild variant="outline" className="gap-2 cursor-pointer">
                      <span>
                        <FileSpreadsheet className="h-4 w-4" />
                        Choose CSV File
                      </span>
                    </Button>
                  </label>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="h-12 w-12 text-amber-600 mb-4" />
                  <p className="font-semibold text-wood-darkest">{fileName}</p>
                  <p className="text-sm text-wood-dark mt-1">
                    {csvRows.length} rows • {csvHeaders.length} columns
                  </p>
                  <label className="mt-4">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button asChild variant="outline" size="sm" className="cursor-pointer">
                      <span>Choose Different File</span>
                    </Button>
                  </label>
                </>
              )}
            </div>

            {/* Preview Table */}
            {previewRows.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-wood-darkest">
                  Preview (first 5 rows)
                </h4>
                <div className="overflow-x-auto rounded-lg border-2 border-wood-dark/20">
                  <table className="w-full text-sm">
                    <thead className="bg-wood/10 border-b border-wood-dark/20">
                      <tr>
                        {csvHeaders.map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-xs font-bold uppercase text-wood-darkest"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-wood-dark/10">
                      {previewRows.map((row, i) => (
                        <tr key={i}>
                          {csvHeaders.map((h) => (
                            <td
                              key={h}
                              className="px-3 py-2 text-wood-dark truncate max-w-[200px]"
                            >
                              {row[h] || "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                onClick={() => setStep("map")}
                disabled={csvRows.length === 0}
                className="gap-2"
              >
                Continue to Map Fields
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Map Fields */}
        {step === "map" && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border-2 border-wood-dark bg-amber/20 p-4">
              <p className="text-sm font-semibold text-wood-darkest">
                File: {fileName}
              </p>
              <p className="text-xs text-wood-dark mt-1">
                {csvHeaders.length} columns detected • Showing sample from first
                row
              </p>
            </div>

            <div className="space-y-3">
              {CONTACT_FIELDS.map((field) => {
                const sampleValue = getSampleValue(mapping[field.key]);

                return (
                  <div
                    key={field.key}
                    className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border-2 border-wood-dark/20 bg-cream p-3"
                  >
                    <div>
                      <Label className="font-bold text-wood-darkest">
                        {field.label}
                      </Label>
                    </div>

                    <ArrowRight className="h-4 w-4 text-wood-dark" />

                    <Select
                      value={mapping[field.key] || "none"}
                      onValueChange={(val) => handleMapping(field.key, val)}
                    >
                      <SelectTrigger>
                        <div className="flex items-center justify-between w-full gap-3">
                          <span className="truncate">
                            {mapping[field.key] || "Select a column..."}
                          </span>
                          {sampleValue && (
                            <span className="text-xs text-wood-dark/40 italic whitespace-nowrap shrink-0">
                              &quot;{sampleValue}&quot;
                            </span>
                          )}
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">— Not Mapped —</SelectItem>
                        {csvHeaders.map((h) => (
                          <SelectItem key={h} value={h}>
                            {h}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep("upload")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={!Object.values(mapping).some((v) => v)}
                size="lg"
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Import {csvRows.length} Contacts
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Import Progress */}
        {step === "import" && (
          <div className="flex flex-col items-center justify-center py-12">
            {importing ? (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-amber-600 mb-4" />
                <p className="text-lg font-semibold text-wood-darkest">
                  Importing contacts...
                </p>
                <p className="text-sm text-wood-dark mt-1">
                  Processing {csvRows.length} records
                </p>
              </>
            ) : importResult?.success ? (
              <>
                <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
                <p className="text-lg font-semibold text-wood-darkest">
                  Import Complete!
                </p>
                <p className="text-sm text-wood-dark mt-1">
                  Successfully imported {importResult.importedCount} contact
                  {importResult.importedCount !== 1 ? "s" : ""}
                </p>
                <Button
                  onClick={() => handleClose(false)}
                  className="mt-6 gap-2"
                >
                  Done
                </Button>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-600 mb-4" />
                <p className="text-lg font-semibold text-wood-darkest">
                  Import Failed
                </p>
                <p className="text-sm text-wood-dark mt-1">
                  Something went wrong. Please try again.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setStep("map")}
                  className="mt-6 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Mapping
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
