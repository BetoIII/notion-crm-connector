"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  ChevronDown,
  Database,
  FileSpreadsheet,
  Pencil,
  Download,
} from "lucide-react";
import Link from "next/link";

interface ContactsToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  sourceFilter: string;
  onSourceFilterChange: (value: string) => void;
  total: number;
  onAddManual: () => void;
  onImportFromSource: () => void;
  onImportCsv: () => void;
}

export function ContactsToolbar({
  searchTerm,
  onSearchChange,
  sourceFilter,
  onSourceFilterChange,
  total,
  onAddManual,
  onImportFromSource,
  onImportCsv,
}: ContactsToolbarProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-wood-darkest">
            CONTACTS
          </h2>
          <p className="text-sm text-wood-dark">
            {total} contact{total !== 1 ? "s" : ""} in database
          </p>
        </div>
        <div className="flex gap-2">
          {/* Connect Source Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Connect Source
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/dashboard/notion-connect">
                <DropdownMenuItem className="cursor-pointer gap-2">
                  <Database className="h-4 w-4" />
                  Notion Database
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={onImportCsv}
              >
                <FileSpreadsheet className="h-4 w-4" />
                CSV File
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Contact Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Contact
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={onAddManual}
              >
                <Pencil className="h-4 w-4" />
                Add Manually
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={onImportFromSource}
              >
                <Database className="h-4 w-4" />
                Import from Source
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-dark/50" />
          <Input
            type="text"
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="notion">Notion</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
            <SelectItem value="csv">CSV Import</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
