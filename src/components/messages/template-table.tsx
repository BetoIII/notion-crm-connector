"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, Search, FileText, Plus } from "lucide-react";
import { getVariableNames } from "@/lib/templates/parser";
import type { MessageTemplate } from "@/lib/templates/types";

interface TemplateTableProps {
  templates: MessageTemplate[];
  onEdit: (template: MessageTemplate) => void;
  onDelete: (templateId: number) => Promise<void>;
  onCreateNew: () => void;
}

export function TemplateTable({
  templates,
  onEdit,
  onDelete,
  onCreateNew,
}: TemplateTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<MessageTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (template: MessageTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header with Search and Create Button */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke/60" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-cream border-2 border-wood-light focus:border-amber-glow transition-colors"
            />
          </div>

          {/* Create New Button - Prominent CTA */}
          <Button
            onClick={onCreateNew}
            size="lg"
            className="gap-2 shadow-lg glow-amber font-heading text-base"
          >
            <Plus className="h-5 w-5" />
            Create Template
          </Button>
        </div>

        {/* Templates Table or Empty State */}
        {filteredTemplates.length === 0 ? (
          <div className="texture-paper card-paper rounded-lg p-12 text-center">
            <FileText className="mx-auto mb-4 h-16 w-16 text-wood-medium/40" />
            <h3 className="mb-2 text-xl font-heading font-bold text-charcoal">
              {searchQuery ? "No templates found" : "No templates yet"}
            </h3>
            <p className="text-sm text-smoke mb-6">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first message template to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={onCreateNew} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Template
              </Button>
            )}
          </div>
        ) : (
          <div className="texture-paper card-paper rounded-lg overflow-hidden">
            {/* Table Header - Wood Panel Style */}
            <div className="texture-wood border-b-4 border-wood-dark">
              <div className="grid grid-cols-12 gap-4 px-6 py-4">
                <div className="col-span-3">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-cream text-embossed">
                    Template Name
                  </span>
                </div>
                <div className="col-span-5">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-cream text-embossed">
                    Content Preview
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-cream text-embossed">
                    Variables
                  </span>
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-xs font-heading font-bold uppercase tracking-wider text-cream text-embossed">
                    Actions
                  </span>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y-2 divide-wood-light/30">
              {filteredTemplates.map((template, index) => {
                const variables = getVariableNames(template.content);

                return (
                  <div
                    key={template.id}
                    className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-tan/20 transition-colors group"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Name Column */}
                    <div className="col-span-3">
                      <h4 className="font-heading font-bold text-charcoal mb-1">
                        {template.name}
                      </h4>
                      <p className="text-xs text-smoke font-body">
                        Updated {formatDate(template.updated_at)}
                      </p>
                    </div>

                    {/* Content Preview Column */}
                    <div className="col-span-5">
                      <p className="text-sm text-charcoal/80 line-clamp-2 font-body leading-relaxed">
                        {template.content}
                      </p>
                    </div>

                    {/* Variables Column */}
                    <div className="col-span-2">
                      {variables.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {variables.slice(0, 3).map((variable) => (
                            <Badge
                              key={variable}
                              variant="secondary"
                              className="text-[10px] px-2 py-0.5 bg-amber-glow/10 text-amber-dim border border-amber-glow/30"
                            >
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                          {variables.length > 3 && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-2 py-0.5 border-wood-light"
                            >
                              +{variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-smoke/60 italic">No variables</span>
                      )}
                    </div>

                    {/* Actions Column */}
                    <div className="col-span-2 flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(template)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-glow/20 hover:text-amber-dim"
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(template)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-burnt-orange/20 hover:text-burnt-orange"
                        title="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer with Count */}
            <div className="border-t-2 border-wood-light/30 bg-tan/10 px-6 py-3">
              <p className="text-xs text-smoke font-body">
                Showing <span className="font-bold text-charcoal">{filteredTemplates.length}</span> of{" "}
                <span className="font-bold text-charcoal">{templates.length}</span> template{templates.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="texture-paper card-paper border-4 border-wood-dark">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading text-2xl text-charcoal">
              Delete Template
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body text-smoke">
              Are you sure you want to delete <span className="font-bold text-charcoal">"{templateToDelete?.name}"</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="font-heading">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-burnt-orange hover:bg-burnt-orange/90 font-heading"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
