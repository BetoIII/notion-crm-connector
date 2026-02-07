"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, Copy, AlertTriangle, Send, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { replaceVariables, validateVariables } from "@/lib/templates/parser";
import type { MessageTemplate, ContactRecord } from "@/lib/templates/types";

interface PromptGeneratorEnhancedProps {
  template: MessageTemplate;
  contacts: ContactRecord[];
  onMessageLogged?: () => void;
}

export function PromptGeneratorEnhanced({
  template,
  contacts,
  onMessageLogged,
}: PromptGeneratorEnhancedProps) {
  const [generatedPrompts, setGeneratedPrompts] = useState<
    Array<{
      contact: ContactRecord;
      message: string;
      missingVars: string[];
    }>
  >([]);
  const [promptCopied, setPromptCopied] = useState(false);

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

  const handleCopyPromptOnly = async () => {
    const prompt = generateBulkPrompt();

    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      setTimeout(() => setPromptCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const contactsWithoutPhone = generatedPrompts.filter((p) => !p.contact.phone);
  const contactsWithMissingVars = generatedPrompts.filter(
    (p) => p.missingVars.length > 0 && p.contact.phone
  );
  const validContacts = generatedPrompts.filter(
    (p) => p.contact.phone && p.missingVars.length === 0
  );

  return (
    <div className="space-y-6">
      {/* Prominent Summary Stats Card */}
      <div className="texture-wood border-4 border-wood-dark rounded-lg p-8">
        <div className="mb-6">
          <h3 className="font-heading text-2xl font-bold text-cream text-embossed mb-2">
            Ready to Send
          </h3>
          <p className="text-cream/80 text-sm font-body">
            Review your message statistics before sending
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Ready to Send */}
          <div className="texture-paper card-paper rounded-lg p-6 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-olive mx-auto" />
            <p className="text-4xl font-heading font-bold text-olive">
              {validContacts.length}
            </p>
            <p className="text-xs font-body uppercase tracking-wider text-smoke">
              Ready to Send
            </p>
          </div>

          {/* Missing Data */}
          <div className="texture-paper card-paper rounded-lg p-6 text-center space-y-2">
            <AlertCircle className="h-8 w-8 text-amber-dim mx-auto" />
            <p className="text-4xl font-heading font-bold text-amber-dim">
              {contactsWithMissingVars.length}
            </p>
            <p className="text-xs font-body uppercase tracking-wider text-smoke">
              Missing Data
            </p>
          </div>

          {/* No Phone */}
          <div className="texture-paper card-paper rounded-lg p-6 text-center space-y-2">
            <XCircle className="h-8 w-8 text-burnt-orange mx-auto" />
            <p className="text-4xl font-heading font-bold text-burnt-orange">
              {contactsWithoutPhone.length}
            </p>
            <p className="text-xs font-body uppercase tracking-wider text-smoke">
              No Phone
            </p>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {contactsWithoutPhone.length > 0 && (
        <div className="texture-paper card-paper rounded-lg border-2 border-burnt-orange p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-burnt-orange/10 shrink-0">
              <AlertTriangle className="h-6 w-6 text-burnt-orange" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-bold text-burnt-orange text-lg mb-2">
                {contactsWithoutPhone.length} Contact{contactsWithoutPhone.length === 1 ? "" : "s"} Missing Phone Number
              </h4>
              <p className="text-sm text-smoke font-body mb-3">
                The following contacts cannot receive messages:
              </p>
              <div className="flex flex-wrap gap-2">
                {contactsWithoutPhone.map((p) => (
                  <span
                    key={p.contact.id}
                    className="px-3 py-1 rounded-md bg-burnt-orange/10 text-burnt-orange text-sm font-body border border-burnt-orange/30"
                  >
                    {p.contact.contact_name || "Unknown"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {contactsWithMissingVars.length > 0 && (
        <div className="texture-paper card-paper rounded-lg border-2 border-amber-dim p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-amber-glow/10 shrink-0">
              <AlertTriangle className="h-6 w-6 text-amber-dim" />
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-bold text-amber-dim text-lg mb-2">
                Some Contacts Have Missing Template Variables
              </h4>
              <p className="text-sm text-smoke font-body">
                These messages will be sent with empty values for missing fields.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Generated Prompt Preview */}
      {validContacts.length > 0 && (
        <div className="texture-paper card-paper rounded-lg overflow-hidden">
          <div className="texture-wood border-b-4 border-wood-dark px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="font-heading text-sm font-bold uppercase tracking-wider text-cream text-embossed">
                  Generated Prompt
                </h4>
                <Button
                  onClick={handleCopyPromptOnly}
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-cream hover:bg-cream/20 hover:text-cream transition-colors"
                  title="Copy prompt to clipboard"
                >
                  {promptCopied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <span className="text-xs text-cream/80 font-body">
                {validContacts.length} message{validContacts.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="max-h-[300px] overflow-y-auto rounded-md border-2 border-wood-light bg-tan/10 p-4 font-mono text-xs leading-relaxed text-charcoal">
              {generateBulkPrompt()}
            </div>

            <p className="mt-4 text-center text-xs text-smoke font-body">
              Paste into Claude Desktop with the "Read and Send iMessages" connector
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {validContacts.length === 0 && contacts.length === 0 && (
        <div className="texture-paper card-paper rounded-lg p-12 text-center">
          <Send className="mx-auto mb-4 h-16 w-16 text-wood-medium/40" />
          <h3 className="mb-2 text-xl font-heading font-bold text-charcoal">
            No Contacts Selected
          </h3>
          <p className="text-sm text-smoke font-body">
            Select contacts to generate personalized messages
          </p>
        </div>
      )}
    </div>
  );
}
