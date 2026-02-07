"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ContactsTable({
  contacts,
  loading,
  selectedIds,
  onSelectAll,
  onSelectContact,
  onEdit,
  page,
  totalPages,
  onPageChange,
}: ContactsTableProps) {
  const allSelected = contacts.length > 0 && selectedIds.length === contacts.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < contacts.length;

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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-wood-dark">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
