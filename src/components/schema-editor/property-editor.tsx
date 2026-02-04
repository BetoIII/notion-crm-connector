"use client";

import { useState } from "react";
import { PropertyDefinition, PropertyType } from "@/lib/schema/types";
import { useSchema, useSchemaMutations } from "@/hooks/use-schema";
import { SelectOptionsEditor } from "./select-options-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";

interface PropertyEditorProps {
  property: PropertyDefinition;
  databaseId: string;
  onClose: () => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "rich_text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select" },
  { value: "multi_select", label: "Multi-select" },
  { value: "date", label: "Date" },
  { value: "people", label: "People" },
  { value: "url", label: "URL" },
  { value: "email", label: "Email" },
  { value: "phone_number", label: "Phone" },
  { value: "relation", label: "Relation" },
];

export function PropertyEditor({
  property,
  databaseId,
  onClose,
}: PropertyEditorProps) {
  const { schema } = useSchema();
  const { updateProperty } = useSchemaMutations();

  const [name, setName] = useState(property.name);
  const [type, setType] = useState(property.type);
  const [options, setOptions] = useState(property.options || []);
  const [relationTarget, setRelationTarget] = useState(
    property.relation?.targetDatabaseKey || ""
  );
  const [syncedName, setSyncedName] = useState(
    property.relation?.syncedPropertyName || ""
  );

  const handleSave = () => {
    const updates: Partial<PropertyDefinition> = {
      name,
      type,
    };

    // Add type-specific data
    if (type === "select" || type === "multi_select") {
      updates.options = options;
    } else {
      updates.options = undefined;
    }

    if (type === "relation") {
      updates.relation = {
        targetDatabaseKey: relationTarget,
        syncedPropertyName: syncedName,
      };
    } else {
      updates.relation = undefined;
    }

    updateProperty(databaseId, property.id, updates);
    onClose();
  };

  const availableDatabases = schema.databases.filter(
    (db) => db.id !== databaseId
  );

  return (
    <div className="rounded-md border-2 border-primary bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Edit Property</h3>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleSave} className="gap-2">
            <Check className="h-4 w-4" />
            Save
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Property Name */}
      <div className="space-y-2">
        <Label htmlFor="property-name">Property Name</Label>
        <Input
          id="property-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Company Name"
        />
      </div>

      {/* Property Type */}
      <div className="space-y-2">
        <Label htmlFor="property-type">Type</Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as PropertyType)}
          disabled={property.type === "title"}
        >
          <SelectTrigger id="property-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_TYPES.map((pt) => (
              <SelectItem key={pt.value} value={pt.value}>
                {pt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {property.type === "title" && (
          <p className="text-xs text-muted-foreground">
            Title type cannot be changed
          </p>
        )}
      </div>

      {/* Select Options Editor */}
      {(type === "select" || type === "multi_select") && (
        <div className="space-y-2">
          <Label>Options</Label>
          <SelectOptionsEditor options={options} onChange={setOptions} />
        </div>
      )}

      {/* Relation Configuration */}
      {type === "relation" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="relation-target">Target Database</Label>
            <Select value={relationTarget} onValueChange={setRelationTarget}>
              <SelectTrigger id="relation-target">
                <SelectValue placeholder="Select database" />
              </SelectTrigger>
              <SelectContent>
                {availableDatabases.map((db) => (
                  <SelectItem key={db.id} value={db.key}>
                    {db.icon} {db.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="synced-name">Synced Property Name</Label>
            <Input
              id="synced-name"
              value={syncedName}
              onChange={(e) => setSyncedName(e.target.value)}
              placeholder="e.g. Company"
            />
            <p className="text-xs text-muted-foreground">
              This property will be created on the target database
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
