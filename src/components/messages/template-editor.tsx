"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { COMMON_VARIABLES } from "@/lib/templates/parser";
import { Loader2, Plus } from "lucide-react";
import type { MessageTemplate } from "@/lib/templates/types";

interface TemplateEditorProps {
  template?: MessageTemplate;
  onSave: (name: string, content: string) => Promise<void>;
  onCancel?: () => void;
}

export function TemplateEditor({ template, onSave, onCancel }: TemplateEditorProps) {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  console.log("TemplateEditor rendered. Template:", template, "Name:", name, "Content:", content);

  // Sync local state when template prop changes
  useEffect(() => {
    if (template) {
      console.log("Updating state from template:", template);
      setName(template.name);
      setContent(template.content);
    } else {
      console.log("Clearing state (no template)");
      setName("");
      setContent("");
    }
  }, [template]);

  const handleInsertVariable = (placeholder: string) => {
    // Insert variable at cursor position or end of content
    const textarea = document.getElementById("template-content") as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newContent =
        content.substring(0, start) + placeholder + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + placeholder.length, start + placeholder.length);
      }, 0);
    } else {
      setContent(content + placeholder);
    }
  };

  const handleSave = async () => {
    setError("");

    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    if (!content.trim()) {
      setError("Template content is required");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(name.trim(), content.trim());
      // Clear form on success if creating new template
      if (!template) {
        setName("");
        setContent("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6">
      <div>
        <h3 className="text-lg font-semibold">
          {template ? `Edit Template: ${template.name}` : "Create New Template"}
        </h3>
        <p className="text-sm text-muted-foreground">
          Use variables like {COMMON_VARIABLES[0].placeholder} to personalize messages
        </p>
      </div>

      <div className="space-y-4">
        {/* Template Name */}
        <div className="space-y-2">
          <Label htmlFor="template-name">Template Name</Label>
          <Input
            id="template-name"
            placeholder="e.g., Welcome Message"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Quick Insert Variables */}
        <div className="space-y-2">
          <Label>Quick Insert Variables</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_VARIABLES.map((variable) => (
              <Button
                key={variable.name}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleInsertVariable(variable.placeholder)}
                disabled={isSaving}
              >
                <Plus className="mr-1 h-3 w-3" />
                {variable.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Template Content */}
        <div className="space-y-2">
          <Label htmlFor="template-content">Message Content</Label>
          <textarea
            id="template-content"
            className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Hi {{contact_name}}, this is a message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSaving}
          />
        </div>

        {/* Character Count */}
        <div className="text-sm text-muted-foreground">
          {content.length} characters
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {template ? "Update Template" : "Save Template"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
