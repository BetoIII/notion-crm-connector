"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowRight,
  ArrowLeft,
  Users,
  Building2,
  Search,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { Contact } from "@/lib/templates/types";

type Step = "details" | "contacts" | "review";

interface CreateListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onListCreated: () => void;
}

export function CreateListModal({
  open,
  onOpenChange,
  onListCreated,
}: CreateListModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [type, setType] = useState<"people" | "companies">("people");
  const [description, setDescription] = useState("");
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [creating, setCreating] = useState(false);

  // Load contacts when entering step 2
  useEffect(() => {
    if (step === "contacts") {
      fetchContacts();
    }
  }, [step]);

  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await fetch("/api/contacts?limit=1000");
      const data = await response.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    const term = searchTerm.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.company?.toLowerCase().includes(term)
    );
  }, [contacts, searchTerm]);

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

  const selectAll = () => {
    setSelectedIds(new Set(filteredContacts.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      const response = await fetch("/api/lists", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          description: description || undefined,
          contactIds: Array.from(selectedIds),
        }),
      });

      if (response.ok) {
        reset();
        onListCreated();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create list");
      }
    } catch (error) {
      console.error("Failed to create list:", error);
      alert("Failed to create list");
    } finally {
      setCreating(false);
    }
  };

  const reset = () => {
    setStep("details");
    setName("");
    setType("people");
    setDescription("");
    setSelectedIds(new Set());
    setSearchTerm("");
  };

  const handleClose = (openState: boolean) => {
    if (!openState) reset();
    onOpenChange(openState);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-wood-darkest">
            Create a List
          </DialogTitle>
          <DialogDescription>
            {step === "details" && "Name your list and choose its type"}
            {step === "contacts" && "Select contacts to add to this list"}
            {step === "review" && "Review your list before creating"}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Details */}
        {step === "details" && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name</Label>
              <Input
                id="list-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Austin Real Estate Brokers"
              />
            </div>

            <div className="space-y-2">
              <Label>List Type</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setType("people")}
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                    type === "people"
                      ? "border-wood-darkest bg-amber/10"
                      : "border-wood-light hover:border-wood"
                  }`}
                >
                  <Users className="h-6 w-6 text-wood-dark" />
                  <div>
                    <p className="font-semibold text-wood-darkest">People</p>
                    <p className="text-xs text-wood-dark">
                      Individual contacts
                    </p>
                  </div>
                </button>
                <button
                  onClick={() => setType("companies")}
                  className={`flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-colors ${
                    type === "companies"
                      ? "border-wood-darkest bg-amber/10"
                      : "border-wood-light hover:border-wood"
                  }`}
                >
                  <Building2 className="h-6 w-6 text-wood-dark" />
                  <div>
                    <p className="font-semibold text-wood-darkest">Companies</p>
                    <p className="text-xs text-wood-dark">
                      Company contacts
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-description">
                Description{" "}
                <span className="text-wood-dark font-normal">(optional)</span>
              </Label>
              <Input
                id="list-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this list..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setStep("contacts")}
                disabled={!name.trim()}
                className="gap-2"
              >
                Add Contacts
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Select Contacts */}
        {step === "contacts" && (
          <div className="flex flex-col flex-1 min-h-0 py-2">
            {/* Search */}
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

            {/* Quick actions */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="text-xs"
                >
                  Select All ({filteredContacts.length})
                </Button>
                {selectedIds.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAll}
                    className="text-xs"
                  >
                    Deselect All
                  </Button>
                )}
              </div>
              <p className="text-xs text-wood-dark">
                {selectedIds.size} selected
              </p>
            </div>

            {/* Contact list */}
            <div className="flex-1 overflow-y-auto max-h-[40vh] rounded-lg border-2 border-wood-light">
              {loadingContacts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-wood-dark/40" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-sm text-wood-dark">
                  {searchTerm
                    ? "No contacts match your search"
                    : "No contacts in your database"}
                </div>
              ) : (
                filteredContacts.map((contact) => (
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
                          <span className="text-xs text-wood-dark truncate">
                            {contact.email}
                          </span>
                        )}
                        {contact.company && (
                          <span className="text-xs text-wood-dark truncate">
                            {contact.company}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setStep("details")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep("review")} className="gap-2">
                Review
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === "review" && (
          <div className="space-y-6 py-4">
            <div className="rounded-lg border-2 border-wood-dark bg-cream p-6 space-y-4">
              <div className="flex items-center gap-3">
                {type === "people" ? (
                  <Users className="h-8 w-8 text-wood-dark" />
                ) : (
                  <Building2 className="h-8 w-8 text-wood-dark" />
                )}
                <div>
                  <h3 className="font-display text-xl font-bold text-wood-darkest">
                    {name}
                  </h3>
                  <p className="text-sm text-wood-dark capitalize">{type}</p>
                </div>
              </div>

              {description && (
                <p className="text-sm text-wood-dark">{description}</p>
              )}

              <div className="flex items-center gap-2 pt-2 border-t border-wood-light">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm text-wood-darkest">
                  {selectedIds.size} contact{selectedIds.size !== 1 ? "s" : ""}{" "}
                  will be added to this list
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setStep("contacts")}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={creating}
                size="lg"
                className="gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create List"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
