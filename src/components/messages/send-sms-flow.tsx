"use client";

import { useState, useEffect, useCallback } from "react";
import { ContactSelector } from "./contact-selector";
import { PromptGenerator } from "./prompt-generator";
import { MessagePreviewExample } from "./message-preview-example";
import { Loader2, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MessageTemplate, ContactRecord } from "@/lib/templates/types";

export function SendSMSFlow() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<ContactRecord[]>([]);

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch("/api/templates");
      const data = await response.json();
      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleContactsSelected = useCallback((contacts: ContactRecord[]) => {
    setSelectedContacts(contacts);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Send SMS</h2>
        <p className="text-muted-foreground">
          Select a template and contacts to send personalized messages
        </p>
      </div>

      {/* Template Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
            Select Template
          </Label>
        </div>

        {isLoadingTemplates ? (
          <div className="flex items-center justify-center rounded-lg border border-border/50 bg-muted/20 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center">
            <MessageSquare className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No templates found. Create a template in the Message Templates tab first.
            </p>
          </div>
        ) : (
          <Select
            value={selectedTemplate?.id.toString() || ""}
            onValueChange={(value) => {
              const template = templates.find((t) => t.id.toString() === value);
              setSelectedTemplate(template || null);
            }}
          >
            <SelectTrigger className="h-11 border-border/60 bg-background text-sm font-medium shadow-sm transition-all hover:border-border hover:bg-background">
              <SelectValue placeholder="Choose a message template..." />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900">
              {templates.map((template) => (
                <SelectItem
                  key={template.id}
                  value={template.id.toString()}
                  className="py-2.5 hover:!bg-gray-100 focus:!bg-gray-100"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-gray-900">{template.name}</span>
                    <span className="text-xs text-gray-500 line-clamp-1">
                      {template.content}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Main Content - Only show if template is selected */}
      {selectedTemplate && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column: Contact Selector */}
          <div>
            <ContactSelector onContactsSelected={handleContactsSelected} />
          </div>

          {/* Right Column: Example Preview or Prompt Generator */}
          <div className="space-y-6">
            {/* Example Preview - Shows for first contact */}
            {selectedContacts.length > 0 && (
              <MessagePreviewExample
                template={selectedTemplate}
                contact={selectedContacts[0]}
              />
            )}

            {/* Prompt Generator - Shows when contacts selected */}
            {selectedContacts.length > 0 && (
              <PromptGenerator
                template={selectedTemplate}
                contacts={selectedContacts}
                onMessageLogged={loadTemplates}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
