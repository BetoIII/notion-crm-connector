"use client";

import { useState, useEffect } from "react";
import { TemplateTable } from "./template-table";
import { TemplateEditorModal } from "./template-editor-modal";
import { Loader2, FileText } from "lucide-react";
import type { MessageTemplate } from "@/lib/templates/types";

export function MessageTemplatesSection() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setEditorOpen(true);
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setEditorOpen(true);
  };

  const handleSaveTemplate = async (name: string, content: string) => {
    if (editingTemplate) {
      // Update existing template
      const response = await fetch(`/api/templates/${editingTemplate.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
    } else {
      // Create new template
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, content }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error);
      }
    }

    await loadTemplates();
    setEditorOpen(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    const response = await fetch(`/api/templates/${templateId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    await loadTemplates();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-amber-glow/10 border-2 border-amber-glow/30">
          <FileText className="h-8 w-8 text-amber-dim" />
        </div>
        <div>
          <h2 className="text-3xl font-heading font-bold text-charcoal mb-2">Message Templates</h2>
          <p className="text-smoke font-body">
            Create and manage SMS templates with personalized variables
          </p>
        </div>
      </div>

      {/* Template List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 texture-paper card-paper rounded-lg">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-wood-medium mx-auto" />
            <p className="text-smoke font-body">Loading templates...</p>
          </div>
        </div>
      ) : (
        <TemplateTable
          templates={templates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onCreateNew={handleCreateNew}
        />
      )}

      {/* Editor Modal */}
      <TemplateEditorModal
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />
    </div>
  );
}
