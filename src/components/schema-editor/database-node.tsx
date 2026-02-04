"use client";

import { useState } from "react";
import { DatabaseDefinition } from "@/lib/schema/types";
import { useSchemaMutations } from "@/hooks/use-schema";
import { PropertyNode } from "./property-node";
import { AddPropertyDialog } from "./add-property-dialog";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DatabaseNodeProps {
  database: DatabaseDefinition;
}

export function DatabaseNode({ database }: DatabaseNodeProps) {
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const { renameDatabase } = useSchemaMutations();

  const nonRelationCount = database.properties.filter(
    (p) => p.type !== "relation"
  ).length;
  const relationCount = database.properties.filter(
    (p) => p.type === "relation"
  ).length;

  return (
    <AccordionItem
      value={database.id}
      className="rounded-lg border border-border bg-card"
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50 rounded-lg">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{database.icon}</span>
          <div className="flex-1 text-left">
            <div className="font-semibold">{database.name}</div>
            {database.description && (
              <div className="text-xs text-muted-foreground">
                {database.description}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {nonRelationCount} properties
            </Badge>
            {relationCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {relationCount} relations
              </Badge>
            )}
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 pt-2">
        <div className="space-y-2">
          {/* Properties List */}
          {database.properties.map((property) => (
            <PropertyNode
              key={property.id}
              property={property}
              databaseId={database.id}
            />
          ))}

          {/* Add Property Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingProperty(true)}
            className="w-full gap-2 mt-2"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </div>

        {/* Add Property Dialog */}
        <AddPropertyDialog
          databaseId={database.id}
          open={isAddingProperty}
          onOpenChange={setIsAddingProperty}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
