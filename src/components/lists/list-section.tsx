"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  Users,
  Building2,
  Trash2,
} from "lucide-react";

interface ContactList {
  id: number;
  name: string;
  type: string;
  description: string | null;
  member_count: number;
  created_at: number;
  updated_at: number;
}

interface ListSectionProps {
  title: string;
  lists: ContactList[];
  type: "people" | "companies";
  onSelectList: (id: number) => void;
  onDelete: (id: number) => void;
}

export function ListSection({
  title,
  lists,
  type,
  onSelectList,
  onDelete,
}: ListSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(lists.length / pageSize);
  const paginatedLists = lists.slice((page - 1) * pageSize, page * pageSize);
  const startRecord = lists.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, lists.length);

  const TypeIcon = type === "people" ? Users : Building2;

  return (
    <div className="rounded-lg border-4 border-wood-dark bg-cream texture-paper overflow-hidden">
      {/* Section Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 bg-wood/10 border-b-2 border-wood-dark hover:bg-wood/15 transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg font-bold text-wood-darkest">
            {title}
          </h3>
          <Badge variant="outline" className="text-xs">
            {lists.length}
          </Badge>
        </div>
        {collapsed ? (
          <ChevronDown className="h-5 w-5 text-wood-dark" />
        ) : (
          <ChevronUp className="h-5 w-5 text-wood-dark" />
        )}
      </button>

      {!collapsed && (
        <>
          {lists.length === 0 ? (
            <div className="p-6 text-center text-sm text-wood-dark">
              No {type} lists yet
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-wood-dark/20 bg-cream">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-wood-darkest">
                        List Name
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-wood-darkest">
                        # of Records
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider text-wood-darkest">
                        Type
                      </th>
                      <th className="w-16 px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-wood-dark/10">
                    {paginatedLists.map((list) => (
                      <tr
                        key={list.id}
                        className="group hover:bg-amber/5"
                      >
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onSelectList(list.id)}
                            className="text-sm font-medium text-wood-darkest hover:underline text-left"
                          >
                            {list.name}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-wood-dark">
                          {list.member_count}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <TypeIcon className="h-3.5 w-3.5 text-wood-dark" />
                            <span className="text-sm text-wood-dark capitalize">
                              {type}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(list.id);
                            }}
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-2 border-t border-wood-dark/20 bg-cream/50">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="h-7 w-7 p-0"
                    >
                      &lt;
                    </Button>
                    <Select
                      value={page.toString()}
                      onValueChange={(v) => setPage(parseInt(v, 10))}
                    >
                      <SelectTrigger className="w-14 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: totalPages }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      className="h-7 w-7 p-0"
                    >
                      &gt;
                    </Button>
                  </div>
                  <p className="text-xs text-wood-dark">
                    {startRecord} - {endRecord} of {lists.length}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
