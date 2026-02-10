"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, Filter } from "lucide-react";
import { ListSection } from "./list-section";
import { CreateListModal } from "./create-list-modal";
import { ListDetailView } from "./list-detail-view";

interface ContactList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  member_count: number;
  created_at: number;
  updated_at: number;
}

export function ListsPage() {
  const [lists, setLists] = useState<ContactList[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);

  const fetchLists = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);

      const response = await fetch(`/api/lists?${params}`);
      const data = await response.json();
      setLists(data.lists || []);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLists();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]); // eslint-disable-line react-hooks/exhaustive-deps

  const peopleLists = lists
    .filter((l) => l.type === "people")
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "member_count") return b.member_count - a.member_count;
      return b.updated_at - a.updated_at;
    });

  const companyLists = lists
    .filter((l) => l.type === "companies")
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "member_count") return b.member_count - a.member_count;
      return b.updated_at - a.updated_at;
    });

  const handleDelete = async (listId: number) => {
    if (!confirm("Are you sure you want to delete this list?")) return;
    try {
      await fetch(`/api/lists/${listId}`, { method: "DELETE" });
      fetchLists();
    } catch (error) {
      console.error("Failed to delete list:", error);
    }
  };

  // If a list is selected, show the detail view
  if (selectedListId !== null) {
    return (
      <ListDetailView
        listId={selectedListId}
        onBack={() => {
          setSelectedListId(null);
          fetchLists();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-wood-darkest">
            MY LISTS
          </h2>
          <p className="text-sm text-wood-dark">
            Organize contacts into targetable collections
          </p>
        </div>
        <Button
          onClick={() => setCreateModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create a list
        </Button>
      </div>

      {/* Search and Sort */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-wood-dark/50" />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wood-dark/50" />
          <Input
            type="text"
            placeholder="Search lists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Last Modified</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="member_count">Record Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="rounded-lg border-4 border-wood-dark bg-cream p-8 text-center texture-paper">
          <p className="text-wood-dark">Loading lists...</p>
        </div>
      ) : lists.length === 0 && !searchTerm ? (
        <div className="rounded-lg border-4 border-wood-dark bg-cream p-12 text-center texture-paper">
          <p className="text-wood-darkest font-semibold text-lg mb-2">
            No lists yet
          </p>
          <p className="text-wood-dark text-sm mb-4">
            Create your first list to organize contacts for SMS campaigns
          </p>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create a list
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <ListSection
            title="People"
            lists={peopleLists}
            type="people"
            onSelectList={setSelectedListId}
            onDelete={handleDelete}
          />
          <ListSection
            title="Companies"
            lists={companyLists}
            type="companies"
            onSelectList={setSelectedListId}
            onDelete={handleDelete}
          />
        </div>
      )}

      <CreateListModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onListCreated={() => {
          setCreateModalOpen(false);
          fetchLists();
        }}
      />
    </div>
  );
}
