"use client";

import { useState, useEffect } from "react";
import { TemplateEditor } from "./template-editor";
import { TemplateList } from "./template-list";
import { Loader2 } from "lucide-react";
import type { MessageTemplate } from "@/lib/templates/types";

export function MessageTemplatesSection() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  // Fetch templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  // Debug: Track editingTemplate changes
  useEffect(() => {
    console.log("editingTemplate changed:", editingTemplate);
  }, [editingTemplate]);

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

  const handleCreateTemplate = async (name: string, content: string) => {
    const response = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    await loadTemplates();
  };

  const handleUpdateTemplate = async (name: string, content: string) => {
    if (!editingTemplate) return;

    const response = await fetch(`/api/templates/${editingTemplate.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, content }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    setEditingTemplate(null);
    await loadTemplates();
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

  const handleEditTemplate = (template: MessageTemplate) => {
    console.log("handleEditTemplate called with:", template);
    setEditingTemplate(template);
    console.log("editingTemplate state updated");
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Message Templates</h2>
        <p className="text-muted-foreground">
          Create and manage SMS templates with personalized variables
        </p>
      </div>

      {/* Template Editor */}
      <div>
        {editingTemplate ? (
          <TemplateEditor
            template={editingTemplate}
            onSave={handleUpdateTemplate}
            onCancel={() => setEditingTemplate(null)}
          />
        ) : (
          <TemplateEditor onSave={handleCreateTemplate} />
        )}
      </div>

      {/* Template List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <TemplateList
          templates={templates}
          onEdit={handleEditTemplate}
          onDelete={handleDeleteTemplate}
          onRefresh={loadTemplates}
        />
      )}
    </div>
  );
}
