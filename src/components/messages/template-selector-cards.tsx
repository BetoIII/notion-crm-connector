"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Search, Check } from "lucide-react";
import { getVariableNames } from "@/lib/templates/parser";
import type { MessageTemplate } from "@/lib/templates/types";

interface TemplateSelectorCardsProps {
  templates: MessageTemplate[];
  selectedTemplate: MessageTemplate | null;
  onSelect: (template: MessageTemplate) => void;
}

export function TemplateSelectorCards({
  templates,
  selectedTemplate,
  onSelect,
}: TemplateSelectorCardsProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter templates based on search
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-smoke/60" />
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-cream border-2 border-wood-light focus:border-amber-glow transition-colors h-12"
        />
      </div>

      {/* Template Cards */}
      {filteredTemplates.length === 0 ? (
        <div className="texture-paper card-paper rounded-lg p-12 text-center">
          <MessageSquare className="mx-auto mb-4 h-16 w-16 text-wood-medium/40" />
          <h3 className="mb-2 text-xl font-heading font-bold text-charcoal">
            {searchQuery ? "No templates found" : "No templates available"}
          </h3>
          <p className="text-sm text-smoke">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Create a template in the Message Templates tab first"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTemplates.map((template) => {
            const variables = getVariableNames(template.content);
            const isSelected = selectedTemplate?.id === template.id;

            return (
              <div
                key={template.id}
                onClick={() => onSelect(template)}
                className={`
                  relative cursor-pointer rounded-lg transition-all duration-200
                  texture-paper card-paper p-6 space-y-4
                  ${
                    isSelected
                      ? "ring-4 ring-amber-glow shadow-xl scale-[1.02] border-amber-glow"
                      : "hover:shadow-lg hover:scale-[1.01] hover:border-amber-glow/50"
                  }
                `}
              >
                {/* Selected Checkmark */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-amber-glow border-2 border-wood-dark flex items-center justify-center shadow-lg">
                    <Check className="h-5 w-5 text-wood-dark stroke-[3]" />
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-amber-glow/10 border border-amber-glow/30 shrink-0">
                    <MessageSquare className="h-5 w-5 text-amber-dim" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-charcoal text-lg mb-1 truncate">
                      {template.name}
                    </h4>
                    <p className="text-xs text-smoke font-body">
                      {variables.length} variable{variables.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                {/* Content Preview */}
                <p className="text-sm text-charcoal/80 font-body line-clamp-3 leading-relaxed">
                  {template.content}
                </p>

                {/* Variables */}
                {variables.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {variables.map((variable) => (
                      <Badge
                        key={variable}
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 bg-amber-glow/10 text-amber-dim border border-amber-glow/30 font-body"
                      >
                        {`{{${variable}}}`}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
