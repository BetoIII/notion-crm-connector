"use client";

import { useState } from "react";
import { DatabasePicker } from "./database-picker";
import { FieldMapper } from "./field-mapper";
import { ImportProgress } from "./import-progress";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { FieldMapping } from "@/lib/templates/types";

type Step = "select" | "map" | "import";

interface SelectedDatabase {
  id: string;
  title: string;
  icon?: string;
  properties: any[];
  sampleRecord?: any;
}

export function NotionConnectPage() {
  const [step, setStep] = useState<Step>("select");
  const [selectedDatabase, setSelectedDatabase] = useState<SelectedDatabase | null>(null);
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>({});
  const [importResult, setImportResult] = useState<{
    success: boolean;
    importedCount: number;
  } | null>(null);

  const handleDatabaseSelected = (database: SelectedDatabase) => {
    setSelectedDatabase(database);
    setStep("map");
  };

  const handleMappingComplete = async (mapping: FieldMapping) => {
    setFieldMapping(mapping);
    setStep("import");

    // Perform the import
    try {
      const response = await fetch("/api/notion/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          database_id: selectedDatabase?.id,
          title: selectedDatabase?.title,
          icon: selectedDatabase?.icon,
          field_mapping: mapping,
        }),
      });

      const data = await response.json();
      setImportResult({
        success: response.ok,
        importedCount: data.importedCount || 0,
      });
    } catch (error) {
      console.error("Import failed:", error);
      setImportResult({ success: false, importedCount: 0 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="texture-wood border-4 border-wood-dark p-6 shadow-xl rounded">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4 gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold font-heading text-cream text-embossed">
          NOTION CONNECTOR
        </h1>
        <p className="text-cream/80 font-body text-sm mt-1">
          Import contacts from your Notion databases
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step === "select" ? "opacity-100" : "opacity-50"}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold ${
            step === "select" ? "border-wood-darkest bg-amber text-wood-darkest" : "border-wood bg-cream text-wood-dark"
          }`}>
            1
          </div>
          <span className="font-semibold text-wood-darkest">Select Database</span>
        </div>

        <div className="h-px w-12 bg-wood-dark/30" />

        <div className={`flex items-center gap-2 ${step === "map" ? "opacity-100" : "opacity-50"}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold ${
            step === "map" ? "border-wood-darkest bg-amber text-wood-darkest" : "border-wood bg-cream text-wood-dark"
          }`}>
            2
          </div>
          <span className="font-semibold text-wood-darkest">Map Fields</span>
        </div>

        <div className="h-px w-12 bg-wood-dark/30" />

        <div className={`flex items-center gap-2 ${step === "import" ? "opacity-100" : "opacity-50"}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 font-bold ${
            step === "import" ? "border-wood-darkest bg-amber text-wood-darkest" : "border-wood bg-cream text-wood-dark"
          }`}>
            3
          </div>
          <span className="font-semibold text-wood-darkest">Import</span>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-lg border-4 border-wood-dark bg-cream texture-paper p-8">
        {step === "select" && (
          <DatabasePicker onSelectDatabase={handleDatabaseSelected} />
        )}

        {step === "map" && selectedDatabase && (
          <FieldMapper
            database={selectedDatabase}
            onComplete={handleMappingComplete}
            onBack={() => setStep("select")}
          />
        )}

        {step === "import" && (
          <ImportProgress
            database={selectedDatabase}
            result={importResult}
          />
        )}
      </div>
    </div>
  );
}
