"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import type { Contact } from "@/lib/templates/types";

interface ContactsTableProps {
  contacts: Contact[];
  loading: boolean;
  selectedIds: number[];
  onSelectAll: (checked: boolean) => void;
  onSelectContact: (id: number, checked: boolean) => void;
  onEdit: (contact: Contact) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ContactsTable({
  contacts,
  loading,
  selectedIds,
  onSelectAll,
  onSelectContact,
  onEdit,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < contacts.length;

  const startRecord = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, total);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="rounded-lg border-4 border-wood-dark bg-cream p-8 text-center texture-paper">
        <p className="text-wood-dark">Loading contacts...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="rounded-lg border-4 border-wood-dark bg-cream p-8 text-center texture-paper">
        <p className="text-wood-dark">No contacts found. Add your first contact or connect a Notion database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-4 border-wood-dark bg-cream texture-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-wood-dark bg-wood/10">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onSelectAll}
                    aria-label="Select all contacts"
                    className={someSelected ? "data-[state=checked]:bg-wood" : ""}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Company
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Source
                </th>
                <th className="w-24 px-4 py-3 text-center text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-dark/20">
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className={`group hover:bg-amber/5 ${
                    selectedIds.includes(contact.id) ? "bg-amber/10" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(contact.id)}
                      onCheckedChange={(checked) =>
                        onSelectContact(contact.id, checked as boolean)
                      }
                      aria-label={`Select ${contact.name || "contact"}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-wood-darkest">
                      {contact.name || `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-wood-dark">
                    {contact.title || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-wood-dark">
                    {contact.company || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-wood-dark">
                    {contact.email || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-wood-dark">
                    {contact.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={contact.source === "notion" ? "default" : "secondary"}
                      className="capitalize"
                    >
                      {contact.source}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(contact)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enhanced Pagination Footer */}
      <div className="flex items-center justify-between">
        {/* Left: Record range */}
        <p className="text-sm text-wood-dark">
          Showing {startRecord}–{endRecord} of {total} contact{total !== 1 ? "s" : ""}
        </p>

        {/* Center: Page numbers */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {getPageNumbers().map((pageNum, idx) =>
              pageNum === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-sm text-wood-dark">
                  ...
                </span>
              ) : (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {pageNum}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Right: Rows per page selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-wood-dark">Rows per page</span>
          <Select
            value={pageSize.toString()}
            onValueChange={(val) => onPageSizeChange(parseInt(val, 10))}
          >
            <SelectTrigger className="w-[70px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
