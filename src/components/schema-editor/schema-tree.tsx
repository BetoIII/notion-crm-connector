"use client";

import { useSchema, useSchemaMutations } from "@/hooks/use-schema";
import { DatabaseNode } from "./database-node";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";

export function SchemaTree() {
  const { schema } = useSchema();
  const { resetSchema } = useSchemaMutations();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CRM Schema</h2>
          <p className="text-sm text-muted-foreground">
            Customize your databases and properties before creating
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetSchema}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>

      {/* Database List */}
      <Accordion type="multiple" className="space-y-2">
        {schema.databases.map((database) => (
          <DatabaseNode key={database.id} database={database} />
        ))}
      </Accordion>
    </div>
  );
}
