"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Users,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
  Search,
} from "lucide-react";
import type { Contact } from "@/lib/templates/types";

interface ContactSelectorProps {
  onContactsSelected: (contacts: Contact[]) => void;
  preSelectedIds?: number[];
}

export function ContactSelector({
  onContactsSelected,
  preSelectedIds = [],
}: ContactSelectorProps) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<number>>(
    new Set(preSelectedIds)
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadContacts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Notify parent when selection changes
  useEffect(() => {
    const selectedContacts = contacts.filter((c) =>
      selectedContactIds.has(c.id)
    );
    onContactsSelected(selectedContacts);
  }, [selectedContactIds, contacts]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadContacts = async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        limit: "1000", // Load all contacts for selection
      });

      if (searchTerm) {
        params.set("search", searchTerm);
      }

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contacts");
      }

      setContacts(data.contacts || []);
    } catch (err: any) {
      setError(err.message || "Failed to load contacts");
      setContacts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleContact = (contactId: number) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedContactIds.size === contacts.length) {
      setSelectedContactIds(new Set());
    } else {
      setSelectedContactIds(new Set(contacts.map((c) => c.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
            Select Contacts
          </Label>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Contact List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} available
          </p>

          {contacts.length > 0 && (
            <Button
              onClick={toggleAll}
              variant="ghost"
              size="sm"
              className="h-8 text-xs font-medium"
            >
              {selectedContactIds.size === contacts.length
                ? "Deselect All"
                : "Select All"}
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center rounded-lg border border-border/50 bg-muted/20 py-12">
            <div className="text-center">
              <Loader2 className="mx-auto mb-2 h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Loading contacts...</p>
            </div>
          </div>
        ) : contacts.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-8 text-center">
            <User className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              {searchTerm
                ? "No contacts match your search"
                : "No contacts in your database. Add contacts or connect a Notion database."}
            </p>
          </div>
        ) : (
          <>
            {/* Selection Summary */}
            {selectedContactIds.size > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-primary">
                    {selectedContactIds.size} contact
                    {selectedContactIds.size === 1 ? "" : "s"} selected
                  </p>
                </div>
              </div>
            )}

            {/* Contact Cards Grid */}
            <div className="space-y-2 rounded-lg border border-border/50 bg-card/30 p-2 shadow-sm">
              <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
                {contacts.map((contact) => {
                  const isSelected = selectedContactIds.has(contact.id);
                  const displayName =
                    contact.name ||
                    `${contact.first_name || ""} ${contact.last_name || ""}`.trim() ||
                    "Unnamed Contact";

                  return (
                    <div
                      key={contact.id}
                      onClick={() => toggleContact(contact.id)}
                      className={`group relative w-full cursor-pointer rounded-md border text-left transition-all ${
                        isSelected
                          ? "border-primary/40 bg-primary/[0.07] shadow-sm"
                          : "border-border/40 bg-card/60 hover:border-border hover:bg-card/90"
                      }`}
                    >
                      <div className="flex items-start gap-3 p-4">
                        {/* Checkbox */}
                        <div className="pt-0.5">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleContact(contact.id)}
                            className="pointer-events-none"
                          />
                        </div>

                        {/* Contact Info */}
                        <div className="min-w-0 flex-1 space-y-2">
                          {/* Name */}
                          <div className="flex items-start gap-2">
                            <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-foreground">
                                {displayName}
                              </p>
                              {contact.title && (
                                <p className="text-xs text-muted-foreground">
                                  {contact.title}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Contact Details Grid */}
                          <div className="grid gap-1.5 sm:grid-cols-2">
                            {contact.phone && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Phone className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                <p className="truncate text-xs text-muted-foreground">
                                  {contact.phone}
                                </p>
                              </div>
                            )}

                            {contact.email && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Mail className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                <p className="truncate text-xs text-muted-foreground">
                                  {contact.email}
                                </p>
                              </div>
                            )}

                            {contact.company && (
                              <div className="flex items-center gap-1.5 min-w-0 sm:col-span-2">
                                <Building2 className="h-3 w-3 shrink-0 text-muted-foreground/70" />
                                <p className="truncate text-xs text-muted-foreground">
                                  {contact.company}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
