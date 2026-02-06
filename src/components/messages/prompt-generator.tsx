"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Copy, AlertTriangle, Users, Send } from "lucide-react";
import { replaceVariables, validateVariables } from "@/lib/templates/parser";
import type { MessageTemplate, ContactRecord } from "@/lib/templates/types";

interface PromptGeneratorProps {
  template: MessageTemplate | null;
  contacts: ContactRecord[];
  onMessageLogged?: () => void;
}

export function PromptGenerator({
  template,
  contacts,
  onMessageLogged,
}: PromptGeneratorProps) {
  const [generatedPrompts, setGeneratedPrompts] = useState<
    Array<{
      contact: ContactRecord;
      message: string;
      missingVars: string[];
    }>
  >([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (template && contacts.length > 0) {
      const prompts = contacts.map((contact) => {
        const message = replaceVariables(template.content, contact);
        const missingVars = validateVariables(template.content, contact);
        return { contact, message, missingVars };
      });
      setGeneratedPrompts(prompts);
    } else {
      setGeneratedPrompts([]);
    }
  }, [template, contacts]);

  const generateBulkPrompt = () => {
    if (generatedPrompts.length === 0) {
      return "Please select contacts to generate prompts.";
    }

    const validPrompts = generatedPrompts.filter((p) => p.contact.phone);

    if (validPrompts.length === 0) {
      return "None of the selected contacts have phone numbers.";
    }

    const promptLines = validPrompts.map((p, idx) => {
      return `${idx + 1}. Send an iMessage to ${p.contact.phone} (${p.contact.contact_name || "Unknown"}) with:
"${p.message}"`;
    });

    return `Send the following ${validPrompts.length} message${validPrompts.length === 1 ? "" : "s"}:

${promptLines.join("\n\n")}`;
  };

  const handleCopy = async () => {
    const prompt = generateBulkPrompt();

    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);

      // Log each message to database
      if (template && onMessageLogged) {
        try {
          const validPrompts = generatedPrompts.filter((p) => p.contact.phone);

          await Promise.all(
            validPrompts.map((p) =>
              fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  template_id: template.id,
                  contact_notion_url: p.contact.url,
                  contact_name: p.contact.contact_name || null,
                  phone_number: p.contact.phone || null,
                  resolved_message: p.message,
                }),
              })
            )
          );
          onMessageLogged();
        } catch (error) {
          console.error("Failed to log messages:", error);
        }
      }

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!template) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-8 text-center">
        <Send className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Select a template above to generate prompts
        </p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-8 text-center">
        <Users className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">
          Select contacts to generate personalized messages
        </p>
      </div>
    );
  }

  const contactsWithoutPhone = generatedPrompts.filter((p) => !p.contact.phone);
  const contactsWithMissingVars = generatedPrompts.filter(
    (p) => p.missingVars.length > 0 && p.contact.phone
  );
  const validContacts = generatedPrompts.filter(
    (p) => p.contact.phone && p.missingVars.length === 0
  );

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-lg border border-border/40 bg-card/50 p-3 text-center">
          <p className="text-2xl font-bold text-primary">{validContacts.length}</p>
          <p className="text-xs text-muted-foreground">Ready to Send</p>
        </div>
        {contactsWithMissingVars.length > 0 && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {contactsWithMissingVars.length}
            </p>
            <p className="text-xs text-amber-600">Missing Data</p>
          </div>
        )}
        {contactsWithoutPhone.length > 0 && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-center">
            <p className="text-2xl font-bold text-destructive">
              {contactsWithoutPhone.length}
            </p>
            <p className="text-xs text-destructive">No Phone</p>
          </div>
        )}
      </div>

      {/* Warnings */}
      {contactsWithoutPhone.length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                {contactsWithoutPhone.length} contact
                {contactsWithoutPhone.length === 1 ? "" : "s"} missing phone number
              </p>
              <p className="mt-1 text-xs text-destructive/80">
                {contactsWithoutPhone.map((p) => p.contact.contact_name || "Unknown").join(", ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {contactsWithMissingVars.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-600">
                Some contacts have missing template variables
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Prompt */}
      {validContacts.length > 0 && (
        <div className="rounded-lg border border-border/60 bg-card shadow-sm">
          <div className="border-b border-border/50 bg-muted/20 px-4 py-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
                Generated Prompt
              </h4>
              <Badge variant="outline" className="text-xs">
                {validContacts.length} message{validContacts.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4 max-h-[300px] overflow-y-auto rounded-md border border-border/40 bg-muted/30 p-4 font-mono text-xs leading-relaxed">
              {generateBulkPrompt()}
            </div>

            <Button onClick={handleCopy} className="w-full" disabled={copied} size="lg">
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy All Messages
                </>
              )}
            </Button>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Paste into Claude Desktop with the "Read and Send iMessages" connector
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
