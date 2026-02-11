"use client";

import { useState, useEffect, useCallback } from "react";
import { ContactsToolbar } from "./contacts-toolbar";
import { ContactsTable } from "./contacts-table";
import { ContactsBulkBar } from "./contacts-bulk-bar";
import { AddContactModal } from "./add-contact-modal";
import { EditContactModal } from "./edit-contact-modal";
import { CSVImportModal } from "./csv-import-modal";
import { ImportFromSourceModal } from "./import-from-source-modal";
import { ContactDetailModal } from "./contact-detail-modal";
import type { Contact } from "@/lib/templates/types";

export function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [csvImportOpen, setCsvImportOpen] = useState(false);
  const [importFromSourceOpen, setImportFromSourceOpen] = useState(false);
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [detailContact, setDetailContact] = useState<Contact | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
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
  }, [page, pageSize, searchTerm, sourceFilter]);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

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
        onAddManual={() => setAddModalOpen(true)}
        onImportFromSource={() => setImportFromSourceOpen(true)}
        onImportCsv={() => setCsvImportOpen(true)}
      />

      <ContactsTable
        contacts={contacts}
        loading={loading}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectContact={handleSelectContact}
        onEdit={handleEdit}
        onRowClick={setDetailContact}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
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

      <CSVImportModal
        open={csvImportOpen}
        onOpenChange={setCsvImportOpen}
        onImportComplete={fetchContacts}
      />

      <ImportFromSourceModal
        open={importFromSourceOpen}
        onOpenChange={setImportFromSourceOpen}
        onImportComplete={fetchContacts}
      />

      {editContact && (
        <EditContactModal
          contact={editContact}
          open={!!editContact}
          onOpenChange={(open) => !open && setEditContact(null)}
          onContactUpdated={handleContactUpdated}
        />
      )}

      <ContactDetailModal
        contact={detailContact}
        open={!!detailContact}
        onOpenChange={(open) => !open && setDetailContact(null)}
        onEdit={(contact) => {
          setDetailContact(null);
          setEditContact(contact);
        }}
      />
    </div>
  );
}
