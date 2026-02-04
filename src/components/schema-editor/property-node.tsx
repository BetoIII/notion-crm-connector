"use client";

import { useState } from "react";
import { PropertyDefinition } from "@/lib/schema/types";
import { useSchema, useSchemaMutations } from "@/hooks/use-schema";
import { PropertyEditor } from "./property-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Link as LinkIcon } from "lucide-react";

interface PropertyNodeProps {
  property: PropertyDefinition;
  databaseId: string;
}

export function PropertyNode({ property, databaseId }: PropertyNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { schema } = useSchema();
  const { deleteProperty } = useSchemaMutations();

  const handleDelete = () => {
    // Prevent deleting title properties
    if (property.type === "title") {
      alert("Cannot delete the title property");
      return;
    }
    if (confirm(`Delete property "${property.name}"?`)) {
      deleteProperty(databaseId, property.id);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      title: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      relation: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      select: "bg-green-500/10 text-green-700 dark:text-green-300",
      multi_select: "bg-green-500/10 text-green-700 dark:text-green-300",
      number: "bg-orange-500/10 text-orange-700 dark:text-orange-300",
      date: "bg-pink-500/10 text-pink-700 dark:text-pink-300",
      people: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    };
    return colors[type] || "bg-gray-500/10 text-gray-700 dark:text-gray-300";
  };

  // Find target database for relation
  const targetDatabase = property.relation
    ? schema.databases.find((db) => db.key === property.relation!.targetDatabaseKey)
    : null;

  if (isEditing) {
    return (
      <PropertyEditor
        property={property}
        databaseId={databaseId}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="group flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2 hover:bg-accent/50 transition-colors">
      {/* Property Name & Type */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{property.name}</span>
          {property.type === "title" && (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={`text-xs ${getTypeColor(property.type)}`}>
            {property.type.replace("_", " ")}
          </Badge>

          {/* Show relation target */}
          {property.relation && targetDatabase && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <LinkIcon className="h-3 w-3" />
              <span>
                {targetDatabase.icon} {targetDatabase.name}
              </span>
            </div>
          )}

          {/* Show option count for select types */}
          {(property.type === "select" || property.type === "multi_select") &&
            property.options && (
              <span className="text-xs text-muted-foreground">
                {property.options.length} options
              </span>
            )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="h-7 w-7 p-0"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={property.type === "title"}
          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
