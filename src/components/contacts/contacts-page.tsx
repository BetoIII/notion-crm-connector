"use client";

import { useState, useEffect, useCallback } from "react";
import { ContactsToolbar } from "./contacts-toolbar";
import { ContactsTable } from "./contacts-table";
import { ContactsBulkBar } from "./contacts-bulk-bar";
import { AddContactModal } from "./add-contact-modal";
import { EditContactModal } from "./edit-contact-modal";
import { NotionSyncPanel } from "./notion-sync-panel";
import type { Contact } from "@/lib/templates/types";

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });

      if (searchTerm) {
        params.set("search", searchTerm);
      }

      if (sourceFilter !== "all") {
        params.set("source", sourceFilter);
      }

      const response = await fetch(`/api/contacts?${params}`);
      const data = await response.json();

      setContacts(data.contacts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm, sourceFilter]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to first page on search
      fetchContacts();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(contacts.map((c) => c.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectContact = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    }
  };

  const handleBulkDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedIds.length} contact(s)?`
      )
    ) {
      return;
    }

    try {
      await fetch("/api/contacts/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      setSelectedIds([]);
      fetchContacts();
    } catch (error) {
      console.error("Failed to delete contacts:", error);
    }
  };

  const handleContactAdded = () => {
    setAddModalOpen(false);
    fetchContacts();
  };

  const handleContactUpdated = () => {
    setEditContact(null);
    fetchContacts();
  };

  const handleEdit = (contact: Contact) => {
    setEditContact(contact);
  };

  return (
    <div className="space-y-4">
      <ContactsToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        sourceFilter={sourceFilter}
        onSourceFilterChange={setSourceFilter}
        total={total}
        onAddContact={() => setAddModalOpen(true)}
      />

      <NotionSyncPanel onSyncComplete={fetchContacts} />

      <ContactsTable
        contacts={contacts}
        loading={loading}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectContact={handleSelectContact}
        onEdit={handleEdit}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {selectedIds.length > 0 && (
        <ContactsBulkBar
          selectedCount={selectedIds.length}
          selectedIds={selectedIds}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds([])}
        />
      )}

      <AddContactModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onContactAdded={handleContactAdded}
      />

      {editContact && (
        <EditContactModal
          contact={editContact}
          open={!!editContact}
          onOpenChange={(open) => !open && setEditContact(null)}
          onContactUpdated={handleContactUpdated}
        />
      )}
    </div>
  );
}
