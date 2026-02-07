"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { SMSStepper } from "./sms-stepper";
import { TemplateSelectorCards } from "./template-selector-cards";
import { ContactSelector } from "./contact-selector";
import { MessagePreviewCarousel } from "./message-preview-carousel";
import { PromptGeneratorEnhanced } from "./prompt-generator-enhanced";
import { Loader2, ChevronRight, ChevronLeft, Send } from "lucide-react";
import type { MessageTemplate, ContactRecord } from "@/lib/templates/types";

const STEPS = [
  {
    number: 1,
    title: "Choose Template",
    description: "Select a message template",
  },
  {
    number: 2,
    title: "Select Contacts",
    description: "Pick who receives messages",
  },
  {
    number: 3,
    title: "Review & Send",
    description: "Preview and send messages",
  },
];

export function SendSMSFlowStepper() {
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
  };

  const canProceedToStep2 = selectedTemplate !== null;
  const canProceedToStep3 = selectedTemplate !== null && selectedContacts.length > 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-amber-glow/10 border-2 border-amber-glow/30">
          <Send className="h-8 w-8 text-amber-dim" />
        </div>
        <div>
          <h2 className="text-3xl font-heading font-bold text-charcoal mb-2">Send SMS Messages</h2>
          <p className="text-smoke font-body">
            Follow the steps below to send personalized messages to your contacts
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="texture-paper card-paper rounded-lg p-8">
        <SMSStepper currentStep={currentStep} steps={STEPS} />
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {/* Step 1: Choose Template */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="texture-wood border-4 border-wood-dark rounded-lg p-6">
              <h3 className="font-heading text-2xl font-bold text-cream text-embossed mb-2">
                Step 1: Choose Your Template
              </h3>
              <p className="text-cream/80 text-sm font-body">
                Select a message template to send to your contacts
              </p>
            </div>

            <div className="texture-paper card-paper rounded-lg p-8">
              {isLoadingTemplates ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-wood-medium mx-auto" />
                    <p className="text-smoke font-body">Loading templates...</p>
                  </div>
                </div>
              ) : (
                <TemplateSelectorCards
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelect={handleTemplateSelect}
                />
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
                size="lg"
                className="gap-2 shadow-lg glow-amber font-heading text-base"
              >
                Continue to Contacts
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Contacts */}
        {currentStep === 2 && selectedTemplate && (
          <div className="space-y-6">
            <div className="texture-wood border-4 border-wood-dark rounded-lg p-6">
              <h3 className="font-heading text-2xl font-bold text-cream text-embossed mb-2">
                Step 2: Select Contacts
              </h3>
              <p className="text-cream/80 text-sm font-body">
                Choose which contacts will receive: <span className="font-bold">{selectedTemplate.name}</span>
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Contact Selector */}
              <div className="texture-paper card-paper rounded-lg p-8">
                <ContactSelector onContactsSelected={handleContactsSelected} />
              </div>

              {/* Right: Preview */}
              <div className="texture-paper card-paper rounded-lg p-8">
                {selectedContacts.length > 0 ? (
                  <MessagePreviewCarousel
                    template={selectedTemplate}
                    contacts={selectedContacts}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-4">
                      <Send className="h-16 w-16 text-wood-medium/40 mx-auto" />
                      <p className="text-smoke font-body">
                        Select contacts to see message previews
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                size="lg"
                className="gap-2 font-heading"
              >
                <ChevronLeft className="h-5 w-5" />
                Back to Templates
              </Button>

              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToStep3}
                size="lg"
                className="gap-2 shadow-lg glow-amber font-heading text-base"
              >
                Review & Send
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Send */}
        {currentStep === 3 && selectedTemplate && selectedContacts.length > 0 && (
          <div className="space-y-6">
            <div className="texture-wood border-4 border-wood-dark rounded-lg p-6">
              <h3 className="font-heading text-2xl font-bold text-cream text-embossed mb-2">
                Step 3: Review & Send
              </h3>
              <p className="text-cream/80 text-sm font-body">
                Review your messages and copy the prompt to send via Claude Desktop
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Left: Prompt Generator with Stats */}
              <div>
                <PromptGeneratorEnhanced
                  template={selectedTemplate}
                  contacts={selectedContacts}
                  onMessageLogged={loadTemplates}
                />
              </div>

              {/* Right: Preview Carousel */}
              <div className="texture-paper card-paper rounded-lg p-8">
                <MessagePreviewCarousel
                  template={selectedTemplate}
                  contacts={selectedContacts}
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={() => setCurrentStep(2)}
                variant="outline"
                size="lg"
                className="gap-2 font-heading"
              >
                <ChevronLeft className="h-5 w-5" />
                Back to Contacts
              </Button>

              <Button
                onClick={() => {
                  // Reset flow after sending
                  setCurrentStep(1);
                  setSelectedTemplate(null);
                  setSelectedContacts([]);
                }}
                variant="outline"
                size="lg"
                className="gap-2 font-heading"
              >
                Start New Campaign
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
