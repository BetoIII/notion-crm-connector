"use client";

import { useState } from "react";
import { SelectOption } from "@/lib/schema/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface SelectOptionsEditorProps {
  options: SelectOption[];
  onChange: (options: SelectOption[]) => void;
}

export function SelectOptionsEditor({
  options,
  onChange,
}: SelectOptionsEditorProps) {
  const [newOption, setNewOption] = useState("");

  const handleAdd = () => {
    if (!newOption.trim()) return;

    onChange([...options, { name: newOption.trim() }]);
    setNewOption("");
  };

  const handleRemove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Options List */}
      <div className="flex flex-wrap gap-2">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">No options yet</p>
        ) : (
          options.map((option, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-2 pr-1 py-1.5"
            >
              {option.name}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(index)}
                className="h-4 w-4 p-0 hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))
        )}
      </div>

      {/* Add Option Input */}
      <div className="flex gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add option..."
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newOption.trim()}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  );
}
