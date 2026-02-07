"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { COMMON_VARIABLES, replaceVariables } from "@/lib/templates/parser";
import { Loader2, Plus, Sparkles, MessageSquare } from "lucide-react";
import type { MessageTemplate } from "@/lib/templates/types";

interface TemplateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: MessageTemplate | null;
  onSave: (name: string, content: string) => Promise<void>;
}

// Mock contact for preview
const MOCK_CONTACT = {
  contact_name: "David Raygo",
  first_name: "David",
  last_name: "Raygo",
  phone: "+1 (415) 517-7071",
  email: "david@example.com",
  company: "Acme Corp",
};

export function TemplateEditorModal({
  open,
  onOpenChange,
  template,
  onSave,
}: TemplateEditorModalProps) {
  const [name, setName] = useState(template?.name || "");
  const [content, setContent] = useState(template?.content || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Sync local state when template prop changes
  useEffect(() => {
    if (template) {
      setName(template.name);
      setContent(template.content);
    } else {
      setName("");
      setContent("");
    }
    setError("");
  }, [template, open]);

  const handleInsertVariable = (placeholder: string) => {
    // Insert variable at cursor position or end of content
    const textarea = document.getElementById("template-content-modal") as HTMLTextAreaElement;
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
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save template");
    } finally {
      setIsSaving(false);
    }
  };

  // Calculate preview message
  const previewMessage = content ? replaceVariables(content, MOCK_CONTACT) : "";

  // Calculate SMS character counts
  const smsLength = content.length;
  const messageCount = smsLength === 0 ? 0 : smsLength <= 160 ? 1 : Math.ceil(smsLength / 153);
  const smsLimit = messageCount <= 1 ? 160 : 153 * messageCount;
  const progressPercent = (smsLength / smsLimit) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[85vh] texture-paper card-paper border-4 border-wood-dark p-0 overflow-hidden">
        {/* Header - Wood Panel */}
        <DialogHeader className="texture-wood border-b-4 border-wood-dark px-8 py-6">
          <DialogTitle className="font-heading text-3xl text-cream text-embossed flex items-center gap-3">
            <Sparkles className="h-7 w-7" />
            {template ? "Edit Template" : "Create New Template"}
          </DialogTitle>
          <p className="text-sm text-cream/80 font-body mt-1">
            Use variables like {COMMON_VARIABLES[0].placeholder} to personalize messages
          </p>
        </DialogHeader>

        {/* Two-Panel Layout */}
        <div className="grid grid-cols-2 gap-0 h-[calc(85vh-140px)] overflow-hidden">
          {/* Left Panel - Editor */}
          <div className="p-8 space-y-6 overflow-y-auto border-r-4 border-wood-light/30 bg-cream">
            {/* Template Name */}
            <div className="space-y-3">
              <Label htmlFor="template-name-modal" className="font-heading text-sm uppercase tracking-wider text-charcoal">
                Template Name
              </Label>
              <Input
                id="template-name-modal"
                placeholder="e.g., Welcome Message"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="h-12 text-base bg-cream border-2 border-wood-light focus:border-amber-glow transition-colors"
              />
            </div>

            {/* Quick Insert Variables */}
            <div className="space-y-3">
              <Label className="font-heading text-sm uppercase tracking-wider text-charcoal">
                Quick Insert Variables
              </Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_VARIABLES.map((variable) => (
                  <Button
                    key={variable.name}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInsertVariable(variable.placeholder)}
                    disabled={isSaving}
                    className="gap-2 border-2 border-wood-light hover:border-amber-glow hover:bg-amber-glow/10 transition-colors font-body"
                  >
                    <Plus className="h-3 w-3" />
                    {variable.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Template Content */}
            <div className="space-y-3">
              <Label htmlFor="template-content-modal" className="font-heading text-sm uppercase tracking-wider text-charcoal">
                Message Content
              </Label>
              <textarea
                id="template-content-modal"
                className="flex min-h-[280px] w-full rounded-md border-2 border-wood-light bg-cream px-4 py-3 text-base font-body leading-relaxed text-charcoal ring-offset-background placeholder:text-smoke/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow focus-visible:ring-offset-2 focus-visible:border-amber-glow disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-none"
                placeholder="Hi {{contact_name}}, this is a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSaving}
              />
            </div>

            {/* Character Counter with Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-body">
                <span className="text-smoke">
                  {smsLength} / {smsLimit} characters
                </span>
                <span className={`font-bold ${messageCount > 1 ? 'text-amber-dim' : 'text-charcoal'}`}>
                  {messageCount} SMS {messageCount !== 1 ? 'messages' : 'message'}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-wood-light/30 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    progressPercent > 100
                      ? 'bg-burnt-orange'
                      : progressPercent > 75
                      ? 'bg-amber-dim'
                      : 'bg-olive'
                  }`}
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              {messageCount > 1 && (
                <p className="text-xs text-amber-dim italic">
                  This message will be sent as {messageCount} separate SMS messages
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-md border-2 border-burnt-orange bg-burnt-orange/10 p-4 text-sm text-burnt-orange font-body">
                {error}
              </div>
            )}
          </div>

          {/* Right Panel - Live Preview */}
          <div className="p-8 space-y-6 overflow-y-auto bg-tan/20">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-wood-medium" />
                <h3 className="font-heading text-lg font-bold text-charcoal uppercase tracking-wider">
                  Live Preview
                </h3>
              </div>

              <p className="text-sm text-smoke font-body">
                See how your message will look with example contact data
              </p>
            </div>

            {/* Mock Contact Info */}
            <div className="texture-paper card-paper rounded-lg p-4 space-y-2 border-2 border-wood-light">
              <p className="text-xs font-heading uppercase tracking-wider text-smoke mb-3">Example Contact</p>
              <div className="space-y-1 font-body text-sm">
                <p className="text-charcoal"><span className="font-bold">Name:</span> {MOCK_CONTACT.contact_name}</p>
                <p className="text-charcoal"><span className="font-bold">Phone:</span> {MOCK_CONTACT.phone}</p>
                <p className="text-charcoal"><span className="font-bold">Email:</span> {MOCK_CONTACT.email}</p>
                <p className="text-charcoal"><span className="font-bold">Company:</span> {MOCK_CONTACT.company}</p>
              </div>
            </div>

            {/* Message Preview - iMessage Style */}
            <div className="space-y-4">
              <p className="text-xs font-heading uppercase tracking-wider text-smoke">Message Preview</p>

              {previewMessage ? (
                <div className="space-y-3">
                  {/* iPhone-style message bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-[85%] rounded-[20px] bg-blue-500 px-5 py-3.5 shadow-lg">
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-white font-body">
                        {previewMessage}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex justify-end">
                    <p className="text-xs text-smoke/60 font-body italic">
                      To: {MOCK_CONTACT.phone}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="texture-paper card-paper rounded-lg border-2 border-dashed border-wood-light p-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-wood-medium/30 mb-3" />
                  <p className="text-sm text-smoke font-body italic">
                    Start typing to see your message preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions - Wood Panel */}
        <div className="texture-wood border-t-4 border-wood-dark px-8 py-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="border-2 border-cream/30 text-cream hover:bg-cream/20 font-heading"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="gap-2 shadow-lg glow-amber font-heading text-base min-w-[180px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {template ? "Update Template" : "Save Template"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
