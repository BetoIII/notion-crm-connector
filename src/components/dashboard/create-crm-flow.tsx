"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSchema, useSchemaMutations, SchemaType } from "@/hooks/use-schema";
import { useCreationStream } from "@/components/creation-progress/use-creation-stream";
import { ProgressPanel } from "@/components/creation-progress/progress-panel";
import { Button } from "@/components/ui/button";
import { SchemaTypeSelector } from "./schema-type-selector";

const SchemaTree = dynamic(
  () => import("@/components/schema-editor/schema-tree").then(mod => ({ default: mod.SchemaTree })),
  { ssr: false }
);
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Rocket, Loader2, RefreshCw } from "lucide-react";

interface NotionPage {
  id: string;
  title: string;
  icon: string | null;
  lastEdited: string;
}

export function CreateCRMFlow() {
  const { schema, schemaType } = useSchema();
  const { setSchemaType } = useSchemaMutations();
  const { status, steps, error, pageUrl, startCreation, reset } = useCreationStream();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pageTitle, setPageTitle] = useState("CRM & Sales Pipeline");
  const [parentPageId, setParentPageId] = useState<string>("");
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [loadingPages, setLoadingPages] = useState(false);
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [useManualId, setUseManualId] = useState(false);

  // Fetch pages when dialog opens
  useEffect(() => {
    if (showConfirmDialog && pages.length === 0) {
      fetchPages();
    }
  }, [showConfirmDialog]);

  const fetchPages = async () => {
    setLoadingPages(true);
    setPagesError(null);
    try {
      const response = await fetch("/api/notion/pages");
      if (!response.ok) {
        throw new Error("Failed to fetch pages");
      }
      const data = await response.json();
      setPages(data.pages || []);
    } catch (error: any) {
      console.error("Error fetching pages:", error);
      setPagesError(error.message || "Failed to load pages");
    } finally {
      setLoadingPages(false);
    }
  };

  const handleSchemaTypeChange = (newType: SchemaType) => {
    setSchemaType(newType);
    // Update page title based on schema type
    setPageTitle(newType === "real-estate" ? "Real Estate CRM" : "CRM & Sales Pipeline");
  };

  const handleCreateClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);

    try {
      await startCreation(schema, pageTitle, parentPageId || undefined);
    } catch (error) {
      console.error('Error in handleConfirm:', error);
    }
  };

  const isCreating = status === "creating";
  const isComplete = status === "complete";
  const hasError = status === "error";
  const showProgress = isCreating || isComplete || hasError;

  const isButtonDisabled = !parentPageId || !pageTitle;

  return (
    <div className="space-y-8">
      {/* Schema Type Selector & Create CRM Button */}
      {!showProgress && (
        <div className="space-y-6">
          <SchemaTypeSelector
            selected={schemaType}
            onChange={handleSchemaTypeChange}
          />
          <div className="flex justify-end">
            <Button
              variant="default"
              size="lg"
              onClick={handleCreateClick}
              className="gap-2"
            >
              <Rocket className="h-5 w-5" />
              Create CRM
            </Button>
          </div>
        </div>
      )}

      {/* Schema Editor or Progress */}
      {showProgress ? (
        <ProgressPanel
          steps={steps}
          status={status}
          error={error}
          pageUrl={pageUrl}
          onReset={reset}
        />
      ) : (
        <div className="rounded-lg border border-border bg-card p-6">
          <SchemaTree />
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent aria-describedby="create-crm-description">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Create {schemaType === "real-estate" ? "Real Estate" : "Standard"} CRM in Notion?
            </AlertDialogTitle>
            <div id="create-crm-description" className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="page-title" className="text-sm font-medium text-white">
                  Page Title
                </Label>
                <Input
                  id="page-title"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder={schemaType === "real-estate" ? "Real Estate CRM" : "CRM & Sales Pipeline"}
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                />
                <p className="text-xs text-white/60">
                  All databases will be created under this page
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="parent-page" className="text-sm font-medium text-white">
                    Parent Page <span className="text-white/60">(required for dev mode)</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    {!loadingPages && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={fetchPages}
                        className="h-auto py-1 px-2 text-xs text-white/60 hover:text-white/80"
                        title="Refresh pages"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    )}
                    {!loadingPages && pages.length === 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUseManualId(!useManualId)}
                        className="h-auto py-1 px-2 text-xs text-blue-400 hover:text-blue-300"
                      >
                        {useManualId ? "Use dropdown" : "Enter ID manually"}
                      </Button>
                    )}
                  </div>
                </div>

                {loadingPages ? (
                  <div className="flex items-center gap-2 py-2 text-white/60">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading pages...</span>
                  </div>
                ) : pagesError ? (
                  <div className="text-sm text-red-400">{pagesError}</div>
                ) : pages.length === 0 || useManualId ? (
                  <div className="space-y-2">
                    <div className="relative rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 transition-all hover:border-white/30 hover:bg-white/10">
                      <input
                        id="parent-page"
                        type="text"
                        value={parentPageId}
                        onChange={(e) => setParentPageId(e.target.value)}
                        placeholder="Enter Notion page ID (e.g., 1234abcd-5678-90ef-...)"
                        className="w-full bg-transparent border-none outline-none text-white placeholder:text-white/40 font-mono text-sm"
                        style={{ color: '#ffffff' }}
                      />
                    </div>
                    {pages.length === 0 && !useManualId && (
                      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                        <p className="text-xs text-yellow-200/90 leading-relaxed">
                          <strong>No pages found.</strong> Your integration needs access to pages.
                          In Notion, open a page and click <strong>⋯ → Add connections</strong> → select your integration.
                          Then refresh this dialog, or enter a page ID manually above.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10">
                    <Select value={parentPageId} onValueChange={setParentPageId}>
                      <SelectTrigger className="bg-transparent border-none text-white h-auto p-4 rounded-xl">
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/15">
                        {pages.map((page) => (
                          <SelectItem
                            key={page.id}
                            value={page.id}
                            className="text-white focus:bg-white/10 focus:text-white"
                          >
                            {page.icon && `${page.icon} `}{page.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <p className="text-xs text-white/60">
                  {pages.length > 0 && !useManualId
                    ? "Select the Notion page where the CRM should be created"
                    : "Paste the ID of the Notion page where the CRM should be created"}
                </p>
              </div>

              <p className="text-base text-white/80 leading-relaxed">
                This will create <span className="font-semibold text-white">{schema.databases.length} databases</span> in your Notion workspace:
              </p>

              <div className="space-y-3">
                {schema.databases.map((db, index) => (
                  <div
                    key={db.id}
                    className="group relative overflow-hidden rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
                    style={{
                      animationDelay: `${index * 75}ms`,
                      animation: 'slideInFromBottom 0.4s ease-out forwards',
                      opacity: 0
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-white/20 to-white/10 text-xl">
                        {db.icon}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white text-base">
                          {db.name}
                        </div>
                        <div className="text-sm text-white/60">
                          {db.properties.length} properties · {db.properties.filter(p => p.type === 'relation').length} relations
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-sm text-white/70 leading-relaxed">
                  All databases will be connected with <span className="font-medium text-blue-300">bidirectional relations</span> as configured in your schema.
                </p>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isButtonDisabled}
            >
              <Rocket className="mr-2 h-4 w-4" />
              Create CRM
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
