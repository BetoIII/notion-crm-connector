"use client";

import { useState } from "react";
import { useSchema } from "@/hooks/use-schema";
import { useCreationStream } from "@/components/creation-progress/use-creation-stream";
import { ProgressPanel } from "@/components/creation-progress/progress-panel";
import { SchemaTree } from "@/components/schema-editor/schema-tree";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Rocket } from "lucide-react";

export function CreateCRMFlow() {
  const { schema } = useSchema();
  const { status, startCreation } = useCreationStream();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pageTitle, setPageTitle] = useState("CRM & Sales Pipeline");

  const handleCreateClick = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setShowConfirmDialog(false);
    await startCreation(schema, pageTitle);
  };

  const isCreating = status === "creating";
  const isComplete = status === "complete";
  const hasError = status === "error";
  const showProgress = isCreating || isComplete || hasError;

  return (
    <div className="space-y-6">
      {/* Create CRM Button */}
      {!showProgress && (
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
      )}

      {/* Schema Editor or Progress */}
      {showProgress ? (
        <ProgressPanel />
      ) : (
        <div className="rounded-lg border border-border bg-card p-6">
          <SchemaTree />
        </div>
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent aria-describedby="create-crm-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Create CRM in Notion?</AlertDialogTitle>
            <div id="create-crm-description" className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="page-title" className="text-sm font-medium text-white">
                  Page Title
                </Label>
                <Input
                  id="page-title"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="CRM & Sales Pipeline"
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/40"
                />
                <p className="text-xs text-white/60">
                  All databases will be created under this page
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
                          {db.properties.length} properties · {db.relations?.length || 0} relations
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
            <AlertDialogAction onClick={handleConfirm}>
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
