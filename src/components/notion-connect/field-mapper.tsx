"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import type { FieldMapping } from "@/lib/templates/types";

interface FieldMapperProps {
  database: {
    id: string;
    title: string;
    properties: any[];
    sampleRecord?: any;
  };
  onComplete: (mapping: FieldMapping) => void;
  onBack: () => void;
}

const CONTACT_FIELDS = [
  { key: "name", label: "Full Name", description: "Contact's full name" },
  { key: "first_name", label: "First Name", description: "First name only" },
  { key: "last_name", label: "Last Name", description: "Last name only" },
  { key: "email", label: "Email", description: "Email address" },
  { key: "phone", label: "Phone", description: "Phone number" },
  { key: "company", label: "Company", description: "Company/organization name" },
  { key: "title", label: "Title", description: "Job title or position" },
  { key: "city", label: "City", description: "City of residence" },
  { key: "state", label: "State", description: "State or province" },
] as const;

const AUTO_SPLIT_VALUE = "__AUTO_SPLIT_FROM_NAME__";

export function FieldMapper({ database, onComplete, onBack }: FieldMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  // Auto-suggest mappings based on property names
  useEffect(() => {
    const autoMapping: Record<string, string> = {};

    CONTACT_FIELDS.forEach((field) => {
      const matchingProperty = database.properties.find((prop: any) => {
        const propName = prop.name.toLowerCase();
        const fieldName = field.key.toLowerCase().replace("_", " ");
        return propName === fieldName || propName.includes(fieldName);
      });

      if (matchingProperty) {
        autoMapping[field.key] = matchingProperty.name;
      }
    });

    // If we have a full name but no first/last name, suggest auto-split
    if (autoMapping.name && !autoMapping.first_name && !autoMapping.last_name) {
      autoMapping.first_name = AUTO_SPLIT_VALUE;
      autoMapping.last_name = AUTO_SPLIT_VALUE;
    }

    setMapping(autoMapping);
  }, [database.properties]);

  const handleMapping = (contactField: string, notionProperty: string) => {
    setMapping({
      ...mapping,
      [contactField]: notionProperty === "none" ? "" : notionProperty,
    });
  };

  const handleComplete = () => {
    // Filter out empty mappings
    const filteredMapping = Object.entries(mapping).reduce(
      (acc, [key, value]) => {
        if (value) {
          acc[key as keyof FieldMapping] = value;
        }
        return acc;
      },
      {} as FieldMapping
    );

    onComplete(filteredMapping);
  };

  // Extract sample value from the record
  const getSampleValue = (propertyName: string | undefined): string => {
    if (!propertyName || !database.sampleRecord) return "";
    if (propertyName === AUTO_SPLIT_VALUE) return ""; // Handle separately

    const properties = database.sampleRecord.properties || {};
    const prop = properties[propertyName];
    if (!prop) return "";

    // Handle different Notion property types
    if (prop.title?.length > 0) return prop.title[0]?.plain_text || "";
    if (prop.rich_text?.length > 0) return prop.rich_text[0]?.plain_text || "";
    if (prop.email) return prop.email;
    if (prop.phone_number) return prop.phone_number;
    if (prop.select?.name) return prop.select.name;
    if (prop.number) return String(prop.number);

    return "";
  };

  // Get sample values for display
  const getSampleForField = (fieldKey: string): string => {
    const mappedProperty = mapping[fieldKey];
    if (!mappedProperty) return "";

    if (mappedProperty === AUTO_SPLIT_VALUE) {
      // Get the full name value and split it
      const fullNameValue = getSampleValue(mapping.name);
      if (!fullNameValue) return "";

      const parts = fullNameValue.trim().split(/\s+/);
      if (fieldKey === "first_name") {
        return parts[0] || "";
      } else if (fieldKey === "last_name") {
        return parts.length > 1 ? parts.slice(1).join(" ") : "";
      }
    }

    return getSampleValue(mappedProperty);
  };

  // Check if we should show auto-split option for first/last name
  const canAutoSplitName = Boolean(mapping.name);
  const fullNameProperty = mapping.name
    ? database.properties.find((p: any) => p.name === mapping.name)?.name
    : null;

  // Get display text for select trigger
  const getDisplayText = (fieldKey: string) => {
    const mappedValue = mapping[fieldKey];
    if (!mappedValue || mappedValue === "none") return "Select a property...";

    if (mappedValue === AUTO_SPLIT_VALUE) {
      return `Auto-split from "${fullNameProperty}"`;
    }

    return mappedValue;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-bold text-wood-darkest mb-2">
          Map Database Fields
        </h3>
        <p className="text-sm text-wood-dark">
          Map Notion properties to contact fields. We've auto-suggested some
          matches based on field names.
        </p>
      </div>

      {/* Database Info */}
      <div className="rounded-lg border-2 border-wood-dark bg-amber/20 p-4">
        <p className="text-sm font-semibold text-wood-darkest">
          Database: {database.title}
        </p>
        <p className="text-xs text-wood-dark mt-1">
          {database.properties.length} properties found
          {database.sampleRecord && " • Showing example from first record"}
        </p>
      </div>

      {/* Field Mapping Grid */}
      <div className="space-y-4">
        {CONTACT_FIELDS.map((field) => {
          const isNameSplitField = field.key === "first_name" || field.key === "last_name";
          const showAutoSplit = isNameSplitField && canAutoSplitName;
          const sampleValue = getSampleForField(field.key);
          const hasSample = Boolean(sampleValue && mapping[field.key]);
          const displayText = getDisplayText(field.key);

          return (
            <div
              key={field.key}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-lg border-2 border-wood-dark/20 bg-cream p-4"
            >
              {/* Contact Field */}
              <div>
                <Label className="font-bold text-wood-darkest">{field.label}</Label>
                <p className="text-xs text-wood-dark mt-1">{field.description}</p>
              </div>

              {/* Arrow */}
              <ArrowRight className="h-5 w-5 text-wood-dark" />

              {/* Notion Property Selector */}
              <Select
                value={mapping[field.key] || "none"}
                onValueChange={(value) => handleMapping(field.key, value)}
              >
                <SelectTrigger>
                  <div className="flex items-center justify-between w-full gap-3">
                    <span className="truncate">{displayText}</span>
                    {hasSample && (
                      <span className="text-xs text-wood-dark/40 italic whitespace-nowrap shrink-0">
                        "{sampleValue}"
                      </span>
                    )}
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Not Mapped —</SelectItem>

                  {/* Auto-split option for first/last name */}
                  {showAutoSplit && (
                    <SelectItem value={AUTO_SPLIT_VALUE}>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3 w-3 text-amber-600" />
                        <span>Auto-split from "{fullNameProperty}"</span>
                      </div>
                    </SelectItem>
                  )}

                  {/* Regular property options */}
                  {database.properties.map((prop: any) => (
                    <SelectItem key={prop.name} value={prop.name}>
                      {prop.name}
                      <span className="ml-2 text-xs text-muted-foreground">
                        ({prop.type})
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button onClick={handleComplete} size="lg" className="gap-2">
          Import Contacts
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
