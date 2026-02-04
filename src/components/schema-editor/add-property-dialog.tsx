"use client";

import { useState } from "react";
import { PropertyType, SelectOption } from "@/lib/schema/types";
import { useSchema, useSchemaMutations } from "@/hooks/use-schema";
import { isPropertyNameUnique } from "@/lib/schema/validators";
import { SelectOptionsEditor } from "./select-options-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

interface AddPropertyDialogProps {
  databaseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
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

export function AddPropertyDialog({
  databaseId,
  open,
  onOpenChange,
}: AddPropertyDialogProps) {
  const { schema } = useSchema();
  const { addProperty } = useSchemaMutations();

  const [name, setName] = useState("");
  const [type, setType] = useState<PropertyType>("rich_text");
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [relationTarget, setRelationTarget] = useState("");
  const [syncedName, setSyncedName] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    // Validate name
    if (!name.trim()) {
      setError("Property name is required");
      return;
    }

    if (!isPropertyNameUnique(name, databaseId, null, schema)) {
      setError("A property with this name already exists");
      return;
    }

    // Build property definition
    const property: any = {
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
    };

    if (type === "select" || type === "multi_select") {
      property.options = options;
    }

    if (type === "relation") {
      if (!relationTarget || !syncedName) {
        setError("Relation requires target database and synced property name");
        return;
      }
      property.relation = {
        targetDatabaseKey: relationTarget,
        syncedPropertyName: syncedName.trim(),
      };
    }

    addProperty(databaseId, property);

    // Reset form
    setName("");
    setType("rich_text");
    setOptions([]);
    setRelationTarget("");
    setSyncedName("");
    setError("");
    onOpenChange(false);
  };

  const handleClose = () => {
    setName("");
    setType("rich_text");
    setOptions([]);
    setRelationTarget("");
    setSyncedName("");
    setError("");
    onOpenChange(false);
  };

  const availableDatabases = schema.databases.filter(
    (db) => db.id !== databaseId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Property</DialogTitle>
          <DialogDescription>
            Add a new property to this database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Property Name */}
          <div className="space-y-2">
            <Label htmlFor="new-property-name">Property Name</Label>
            <Input
              id="new-property-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g. Industry"
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="new-property-type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => setType(value as PropertyType)}
            >
              <SelectTrigger id="new-property-type">
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
          </div>

          {/* Select Options */}
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
                <Label htmlFor="new-relation-target">Target Database</Label>
                <Select
                  value={relationTarget}
                  onValueChange={setRelationTarget}
                >
                  <SelectTrigger id="new-relation-target">
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
                <Label htmlFor="new-synced-name">Synced Property Name</Label>
                <Input
                  id="new-synced-name"
                  value={syncedName}
                  onChange={(e) => setSyncedName(e.target.value)}
                  placeholder="e.g. Related Items"
                />
                <p className="text-xs text-muted-foreground">
                  This property will be created on the target database
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>Add Property</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
