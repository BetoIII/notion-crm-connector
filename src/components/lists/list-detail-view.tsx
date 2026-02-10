"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Search,
  Plus,
  Trash2,
  Users,
  Building2,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Contact } from "@/lib/templates/types";

interface ListDetail {
  id: number;
  name: string;
  type: string;
  description: string | null;
  member_count: number;
  created_at: number;
  updated_at: number;
}

interface ListDetailViewProps {
  listId: number;
  onBack: () => void;
}

export function ListDetailView({ listId, onBack }: ListDetailViewProps) {
  const [list, setList] = useState<ListDetail | null>(null);
  const [members, setMembers] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [addMembersOpen, setAddMembersOpen] = useState(false);

  const fetchListDetail = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (searchTerm) params.set("search", searchTerm);

      const response = await fetch(`/api/lists/${listId}?${params}`);
      const data = await response.json();

      setList(data.list);
      setMembers(data.members || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch list detail:", error);
    } finally {
      setLoading(false);
    }
  }, [listId, page, searchTerm]);

  useEffect(() => {
    fetchListDetail();
  }, [fetchListDetail]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchListDetail();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemoveSelected = async () => {
    if (
      !confirm(
        `Remove ${selectedIds.length} contact(s) from this list?`
      )
    )
      return;

    try {
      await fetch(`/api/lists/${listId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: selectedIds }),
      });
      setSelectedIds([]);
      fetchListDetail();
    } catch (error) {
      console.error("Failed to remove members:", error);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(members.map((m) => m.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectContact = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    }
  };

  const allSelected =
    members.length > 0 && selectedIds.length === members.length;

  // Build SMS link with list member IDs
  const smsLink = useMemo(() => {
    if (members.length === 0) return "/dashboard?tab=send-sms";
    const ids = members.map((m) => m.id).join(",");
    return `/dashboard?tab=send-sms&contactIds=${ids}`;
  }, [members]);

  if (loading && !list) {
    return (
      <div className="rounded-lg border-4 border-wood-dark bg-cream p-8 text-center texture-paper">
        <p className="text-wood-dark">Loading list...</p>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Lists
        </Button>
        <div className="rounded-lg border-4 border-wood-dark bg-cream p-8 text-center texture-paper">
          <p className="text-wood-dark">List not found</p>
        </div>
      </div>
    );
  }

  const TypeIcon = list.type === "people" ? Users : Building2;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <TypeIcon className="h-6 w-6 text-wood-dark" />
            <div>
              <h2 className="font-display text-2xl font-bold text-wood-darkest">
                {list.name}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline" className="text-xs capitalize">
                  {list.type}
                </Badge>
                <span className="text-sm text-wood-dark">
                  {total} member{total !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <a href={smsLink}>
            <Button variant="outline" className="gap-2">
              <Send className="h-4 w-4" />
              Send SMS to List
            </Button>
          </a>
          <Button
            onClick={() => setAddMembersOpen(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Members
          </Button>
        </div>
      </div>

      {list.description && (
        <p className="text-sm text-wood-dark">{list.description}</p>
      )}

      {/* Search + Bulk Actions */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-dark/50" />
          <Input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        {selectedIds.length > 0 && (
          <Button
            variant="outline"
            onClick={handleRemoveSelected}
            className="gap-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
            Remove {selectedIds.length}
          </Button>
        )}
      </div>

      {/* Members Table */}
      <div className="rounded-lg border-4 border-wood-dark bg-cream texture-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b-2 border-wood-dark bg-wood/10">
              <tr>
                <th className="w-12 px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-sm font-bold uppercase tracking-wider text-wood-darkest">
                  Company
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wood-dark/20">
              {members.map((member) => (
                <tr
                  key={member.id}
                  className={`hover:bg-amber/5 ${
                    selectedIds.includes(member.id) ? "bg-amber/10" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.includes(member.id)}
                      onCheckedChange={(checked) =>
                        handleSelectContact(member.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-wood-darkest">
                      {member.name ||
                        `${member.first_name || ""} ${member.last_name || ""}`.trim() ||
                        "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-wood-dark">
                    {member.email || "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-wood-dark">
                    {member.phone || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-wood-dark">
                    {member.company || "—"}
                  </td>
                </tr>
              ))}
              {members.length === 0 && !loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-wood-dark"
                  >
                    {searchTerm
                      ? "No members match your search"
                      : "No members in this list yet"}
                  </td>
                </tr>
              )}
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
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Members Modal */}
      <AddMembersModal
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        listId={listId}
        existingMemberIds={members.map((m) => m.id)}
        onMembersAdded={fetchListDetail}
      />
    </div>
  );
}

// Sub-component for adding members to a list
function AddMembersModal({
  open,
  onOpenChange,
  listId,
  existingMemberIds,
  onMembersAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listId: number;
  existingMemberIds: number[];
  onMembersAdded: () => void;
}) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      fetchContacts();
      setSelectedIds(new Set());
      setSearchTerm("");
    }
  }, [open]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/contacts?limit=1000");
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const existingSet = useMemo(
    () => new Set(existingMemberIds),
    [existingMemberIds]
  );

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.company?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [contacts, searchTerm]);

  const newContacts = filteredContacts.filter((c) => !existingSet.has(c.id));
  const existingContacts = filteredContacts.filter((c) =>
    existingSet.has(c.id)
  );

  const toggleContact = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAdd = async () => {
    if (selectedIds.size === 0) return;
    setAdding(true);
    try {
      await fetch(`/api/lists/${listId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactIds: Array.from(selectedIds) }),
      });
      onMembersAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add members:", error);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-wood-darkest">
            Add Members
          </DialogTitle>
          <DialogDescription>
            Select contacts to add to this list
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-dark/50" />
          <Input
            type="text"
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex-1 overflow-y-auto max-h-[50vh] rounded-lg border-2 border-wood-light">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-wood-dark/40" />
            </div>
          ) : (
            <>
              {newContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => toggleContact(contact.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 border-b border-wood-light/50 hover:bg-amber/5 cursor-pointer ${
                    selectedIds.has(contact.id) ? "bg-amber/10" : ""
                  }`}
                >
                  <Checkbox
                    checked={selectedIds.has(contact.id)}
                    onCheckedChange={() => toggleContact(contact.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-wood-darkest truncate">
                      {contact.name ||
                        `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                        "Unknown"}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5">
                      {contact.email && (
                        <span className="text-xs text-wood-dark">
                          {contact.email}
                        </span>
                      )}
                      {contact.company && (
                        <span className="text-xs text-wood-dark">
                          {contact.company}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {existingContacts.length > 0 && (
                <>
                  <div className="px-3 py-2 bg-wood/5 border-b border-t border-wood-light">
                    <p className="text-xs font-semibold text-wood-dark uppercase tracking-wider">
                      Already in this list
                    </p>
                  </div>
                  {existingContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 px-3 py-2.5 border-b border-wood-light/50 opacity-50"
                    >
                      <Checkbox checked disabled />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-wood-dark truncate">
                          {contact.name ||
                            `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                            "Unknown"}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        Already added
                      </Badge>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-wood-light">
          <p className="text-sm text-wood-dark">
            {selectedIds.size > 0
              ? `${selectedIds.size} contact${selectedIds.size !== 1 ? "s" : ""} selected`
              : "Select contacts to add"}
          </p>
          <Button
            onClick={handleAdd}
            disabled={selectedIds.size === 0 || adding}
            className="gap-2"
          >
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add to List
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
