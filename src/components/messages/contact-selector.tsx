"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Database,
  Users,
  User,
  Phone,
  Mail,
  Building2,
  CheckCircle2,
} from "lucide-react";
import type { ContactData } from "@/lib/templates/types";

interface NotionDatabase {
  id: string;
  title: string;
  icon: string | null;
  lastEdited: string;
}

interface ContactRecord extends ContactData {
  id: string;
  url: string;
}

interface ContactSelectorProps {
  onContactsSelected: (contacts: ContactRecord[]) => void;
}

export function ContactSelector({ onContactsSelected }: ContactSelectorProps) {
  const [databases, setDatabases] = useState<NotionDatabase[]>([]);
  const [selectedDatabaseId, setSelectedDatabaseId] = useState<string>("");
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  const [isLoadingDatabases, setIsLoadingDatabases] = useState(true);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [error, setError] = useState("");

  // Load databases on mount
  useEffect(() => {
    loadDatabases();
  }, []);

  // Load contacts when database is selected
  useEffect(() => {
    if (selectedDatabaseId) {
      loadContacts(selectedDatabaseId);
    } else {
      setContacts([]);
      setSelectedContactIds(new Set());
    }
  }, [selectedDatabaseId]);

  // Notify parent when selection changes - simplified without complex change detection
  useEffect(() => {
    const selectedContacts = contacts.filter((c) =>
      selectedContactIds.has(c.id)
    );
    onContactsSelected(selectedContacts);
  }, [selectedContactIds]);

  const loadDatabases = async () => {
    setIsLoadingDatabases(true);
    setError("");
    try {
      const response = await fetch("/api/notion/databases");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch databases");
      }

      setDatabases(data.databases || []);
    } catch (err: any) {
      setError(err.message || "Failed to load databases");
      setDatabases([]);
    } finally {
      setIsLoadingDatabases(false);
    }
  };

  const loadContacts = async (databaseId: string) => {
    setIsLoadingContacts(true);
    setError("");
    setContacts([]);
    setSelectedContactIds(new Set());

    try {
      const response = await fetch(
        `/api/notion/databases/${databaseId}/records`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch contacts");
      }

      setContacts(data.records || []);
    } catch (err: any) {
      setError(err.message || "Failed to load contacts");
      setContacts([]);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const toggleContact = (contactId: string) => {
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
      {/* Database Selector */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
            Select Database
          </Label>
        </div>

        {isLoadingDatabases ? (
          <div className="flex items-center justify-center rounded-lg border border-border/50 bg-muted/20 py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : databases.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border/60 bg-muted/10 p-6 text-center">
            <Database className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No databases found in your workspace
            </p>
          </div>
        ) : (
          <Select value={selectedDatabaseId} onValueChange={setSelectedDatabaseId}>
            <SelectTrigger className="h-11 border-border/60 bg-background text-sm font-medium shadow-sm transition-all hover:border-border hover:bg-background">
              <SelectValue placeholder="Choose a contact database..." />
            </SelectTrigger>
            <SelectContent className="!bg-white !text-gray-900">
              {databases.map((db) => (
                <SelectItem key={db.id} value={db.id} className="py-2.5 hover:!bg-gray-100 focus:!bg-gray-100">
                  <div className="flex items-center gap-2">
                    {db.icon && (
                      <span className="text-base">{db.icon}</span>
                    )}
                    <span className="font-medium text-gray-900">{db.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Contact List */}
      {selectedDatabaseId && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-semibold uppercase tracking-wider text-foreground/90">
                Select Contacts
              </Label>
            </div>

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

          {isLoadingContacts ? (
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
                No contacts found in this database
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
                            {contact.contact_name && (
                              <div className="flex items-start gap-2">
                                <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-sm font-semibold text-foreground">
                                    {contact.contact_name}
                                  </p>
                                </div>
                              </div>
                            )}

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

                            {/* Fallback if no data */}
                            {!contact.contact_name &&
                              !contact.phone &&
                              !contact.email &&
                              !contact.company && (
                                <p className="text-xs italic text-muted-foreground/60">
                                  No contact information available
                                </p>
                              )}
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
      )}
    </div>
  );
}
