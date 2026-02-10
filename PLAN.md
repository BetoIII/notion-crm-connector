# Contacts Page UI Improvement Plan

## Overview
Four major features to implement, synthesized from UX architecture analysis of the current codebase and Apollo-style reference designs.

---

## Feature 1: Pagination with Page Size Selector

**Current state:** Hardcoded 25 items/page, basic prev/next buttons, "Page X of Y" text.

**Changes:**

### contacts-page.tsx
- Add `pageSize` state, default `20`
- Replace hardcoded `limit: "25"` with dynamic `limit: pageSize.toString()`
- Reset `page` to 1 when `pageSize` changes
- Pass `pageSize`, `total`, and `onPageSizeChange` to `ContactsTable`

### contacts-table.tsx
- Add `pageSize`, `total`, `onPageSizeChange` props
- Replace the pagination section with an enhanced footer:
  - **Left:** "Showing 1–20 of 97 contacts"
  - **Center:** Page number buttons (1, 2, 3, ... N) with prev/next arrows
  - **Right:** "Rows per page" dropdown with options: 20, 50, 100
- Use the existing Radix `Select` component for the rows-per-page dropdown
- Show the pagination footer always (not just when `totalPages > 1`) since the page size selector should always be accessible

### API (no changes needed)
- `/api/contacts` already accepts `limit` and `page` params

**Files to modify:**
| File | Action |
|------|--------|
| `src/components/contacts/contacts-page.tsx` | MODIFY - add pageSize state |
| `src/components/contacts/contacts-table.tsx` | MODIFY - enhanced pagination footer |

---

## Feature 2: "Connect Source" Button (replaces "Connect Notion")

**Current state:** "Connect Notion" links to `/dashboard/notion-connect`. Only Notion import exists.

**Changes:**

### contacts-toolbar.tsx
- Replace the "Connect Notion" `<Link>` button with a "Connect Source" button that opens a Radix `DropdownMenu`
- Dropdown items:
  - "Notion Database" (Database icon) → navigates to existing `/dashboard/notion-connect`
  - "CSV File" (FileUp icon) → opens new CSV import modal
- Add `@radix-ui/react-dropdown-menu` if not already installed, create `dropdown-menu.tsx` UI primitive

### New: CSV Import Flow (3-step modal mirroring Notion connect)
Create a new CSV import modal at `src/components/contacts/csv-import-modal.tsx` with three steps:

**Step 1: Upload & Preview**
- File input accepting `.csv` files
- Client-side CSV parsing (using `papaparse` or simple built-in parser)
- Show preview table of first 5 rows with detected column headers
- Show total row count

**Step 2: Map Fields**
- Reuse the same field mapping UX as `field-mapper.tsx`
- Show detected CSV columns on left, contact fields on right
- Auto-suggest mappings based on column header names (e.g., "Email" → email, "Company" → company)
- Show sample values from first row

**Step 3: Import Progress**
- Show importing spinner, then success/failure with count
- POST to new `/api/contacts/import-csv` endpoint

### New API endpoint: `/api/contacts/import-csv`
- Accepts JSON body with `{ contacts: MappedContact[], source: 'csv' }`
- Uses `contactDB.createMany()` to batch insert
- Returns `{ importedCount: N }`

**Files to create/modify:**
| File | Action |
|------|--------|
| `src/components/contacts/contacts-toolbar.tsx` | MODIFY - dropdown button |
| `src/components/contacts/csv-import-modal.tsx` | CREATE - 3-step CSV import flow |
| `src/components/ui/dropdown-menu.tsx` | CREATE - Radix DropdownMenu primitive |
| `src/app/api/contacts/import-csv/route.ts` | CREATE - CSV import API |
| `src/components/contacts/contacts-page.tsx` | MODIFY - add csvImportOpen state |

---

## Feature 3: "Add Contact" → Source Gateway with Selective Import

**Current state:** "Add Contact" opens a simple manual form modal. `NotionSyncPanel` is always visible on the contacts page showing connected Notion DBs.

**Design decision (from UX debate):** Use a **dropdown on the "Add Contact" button** as the entry point, NOT tabs in a single modal. This keeps the lightweight manual action fast and gives the complex source browsing its own dedicated experience.

**Changes:**

### contacts-toolbar.tsx
- Replace "Add Contact" button with a **"+ Add Contact"** button that has a `ChevronDown` and opens a `DropdownMenu`
- Dropdown items:
  - "Add Manually" (Pencil icon) → opens existing `AddContactModal`
  - "Import from Source" (Database icon) → opens new `ImportFromSourceModal`

### contacts-page.tsx
- **Remove `<NotionSyncPanel />`** from the render tree entirely
- Add `importFromSourceOpen` state
- Wire dropdown triggers to respective modals

### New: ImportFromSourceModal (two-panel drill-down)
Create `src/components/contacts/import-from-source-modal.tsx`:

**Panel 1 — Source List:**
- Fetches `GET /api/notion/connect` on mount (reuses NotionSyncPanel's logic)
- Shows each connected source as a card: icon, title, contact count badge, last synced timestamp, small refresh button
- Also shows connected CSV imports (tracked in a new `connected_sources` concept or simply listing unique `source_database_id` values for csv sources)
- **Empty state:** "No sources connected yet" with a "Connect a Source" CTA
- Clicking a source card transitions to Panel 2

**Panel 2 — Contact Selector (drill-down from a source):**
- Header: back arrow, source title, "Refresh from Source" button
- Search input for filtering the contact preview list
- Scrollable list of contact rows (`max-h-[60vh] overflow-y-auto`)
- Each row: checkbox, name, email/phone preview
- **Already-imported contacts:** Shown at the bottom, muted (lower opacity), with "Already imported" badge. Checkbox shows green check but is still toggleable (for re-import/re-sync)
- **Not-yet-imported contacts:** Shown at top, full opacity, active checkboxes, subtle amber left border highlight
- "Select All New" convenience button above the list
- **Sticky footer:** "[N] selected" counter + "Import Selected" primary button
- On import: POST to new selective import endpoint

**Modal sizing:** `max-w-4xl max-h-[85vh]` with internal flex layout (fixed header, scrollable body, fixed footer)

### New API: Selective Import
Create `/api/notion/connect/[id]/import-selected/route.ts`:
- Accepts `{ page_ids: string[] }` — specific Notion page IDs to import
- Fetches connection details and field mapping
- Fetches records from Notion, filters to requested page_ids
- Maps and inserts only selected contacts
- Returns `{ importedCount: N }`

### New API: Preview Records from Source
Create `/api/notion/connect/[id]/preview/route.ts`:
- Fetches records from Notion for a connected DB
- Cross-references with local contacts table to mark already-imported
- Returns `{ records: [...], alreadyImported: string[] }` (page IDs that exist locally)

**Files to create/modify:**
| File | Action |
|------|--------|
| `src/components/contacts/import-from-source-modal.tsx` | CREATE - main two-panel modal |
| `src/components/contacts/source-list-panel.tsx` | CREATE - Panel 1: source cards |
| `src/components/contacts/source-contact-selector.tsx` | CREATE - Panel 2: contact selection |
| `src/components/contacts/contacts-toolbar.tsx` | MODIFY - dropdown on Add Contact |
| `src/components/contacts/contacts-page.tsx` | MODIFY - remove NotionSyncPanel, add state |
| `src/app/api/notion/connect/[id]/preview/route.ts` | CREATE - preview records API |
| `src/app/api/notion/connect/[id]/import-selected/route.ts` | CREATE - selective import API |

---

## Feature 4: Contact Lists (Apollo-style)

**Current state:** No list functionality exists. No DB tables for lists.

**Design:** Add a new "Lists" tab to the dashboard (alongside Contacts, CRM Builder, etc.) with Apollo-style People and Companies sections.

### Database Schema Changes
Add to `schema.sql`:

```sql
-- Contact Lists Table
CREATE TABLE IF NOT EXISTS contact_lists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'people',  -- 'people' or 'companies'
  description TEXT,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Contact List Members Junction Table
CREATE TABLE IF NOT EXISTS contact_list_members (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  list_id INTEGER NOT NULL,
  contact_id INTEGER NOT NULL,
  added_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (list_id) REFERENCES contact_lists(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
  UNIQUE(list_id, contact_id)
);

CREATE INDEX IF NOT EXISTS idx_list_members_list ON contact_list_members(list_id);
CREATE INDEX IF NOT EXISTS idx_list_members_contact ON contact_list_members(contact_id);
```

### DB Client (client.ts)
Add a new `listDB` object with methods:
- `getAll()` — all lists with member counts
- `getById(id)` — single list with members
- `create(name, type, description?)` — create list
- `update(id, name, description?)` — update list
- `delete(id)` — delete list (cascade deletes members)
- `addMembers(listId, contactIds[])` — add contacts to list
- `removeMembers(listId, contactIds[])` — remove contacts from list
- `getMembers(listId, options?)` — get contacts in a list with pagination

### API Routes
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/lists` | GET | List all lists with counts, grouped by type |
| `/api/lists` | POST | Create a new list |
| `/api/lists/[id]` | GET | Get list details + members |
| `/api/lists/[id]` | PUT | Update list name/description |
| `/api/lists/[id]` | DELETE | Delete list |
| `/api/lists/[id]/members` | POST | Add contacts to list `{ contactIds: [] }` |
| `/api/lists/[id]/members` | DELETE | Remove contacts from list `{ contactIds: [] }` |

### UI Components

**Dashboard tab:** Add a "Lists" tab to the dashboard `TabsList` in `dashboard/page.tsx`.

**ListsPage** (`src/components/lists/lists-page.tsx`):
- Two collapsible sections: "People" and "Companies" (using Radix Collapsible or custom)
- Each section header: type label + count badge + collapse/expand chevron
- Table columns: checkbox, List Name (clickable link), # of Records, Type badge
- Pagination per section (matching Apollo reference: "1 - 4 of 4")
- Header toolbar: "Search lists" input + sort dropdown (Last Modified, Name, Record Count) + "+ Create a list" button

**CreateListModal** (`src/components/lists/create-list-modal.tsx`):
- Step 1: Name the list + choose type (People / Companies) radio buttons
- Step 2: Add contacts — reuse/adapt the existing `ContactSelector` component from the SMS flow, filtered by type (people contacts vs. company contacts)
- Step 3: Review — show summary card with list name, type, member count, preview of first few members
- Submit: POST to `/api/lists` then POST to `/api/lists/[id]/members`

**ListDetailPage** (`src/components/lists/list-detail-view.tsx`):
- Shown when clicking a list name
- Header: list name, type badge, member count, "Edit" and "Delete" buttons
- Search + filter bar for members
- Contacts table (reuse `ContactsTable` pattern)
- "Add Members" button → opens contact selector
- "Remove Selected" bulk action
- **"Send SMS to List"** button → navigates to Send SMS tab with list contacts pre-selected (using existing `contactIds` URL param pattern)

### SMS Flow Integration
- In the Send SMS flow's Step 2 (Contact Selector), add a "Select from List" option
- When user picks a list, all list members are pre-selected
- This reuses the existing `preSelectedContactIds` mechanism in `SendSMSFlowStepper`

**Files to create/modify:**
| File | Action |
|------|--------|
| `src/lib/db/schema.sql` | MODIFY - add contact_lists + contact_list_members tables |
| `src/lib/db/client.ts` | MODIFY - add listDB operations |
| `src/app/api/lists/route.ts` | CREATE - list CRUD |
| `src/app/api/lists/[id]/route.ts` | CREATE - single list ops |
| `src/app/api/lists/[id]/members/route.ts` | CREATE - member management |
| `src/components/lists/lists-page.tsx` | CREATE - main lists view |
| `src/components/lists/create-list-modal.tsx` | CREATE - list creation flow |
| `src/components/lists/list-detail-view.tsx` | CREATE - list detail/members view |
| `src/components/lists/list-section.tsx` | CREATE - collapsible People/Companies section |
| `src/app/dashboard/page.tsx` | MODIFY - add Lists tab |
| `src/components/messages/contact-selector.tsx` | MODIFY - add "Select from List" option |

---

## Implementation Order

1. **Feature 1: Pagination** (smallest scope, foundational)
2. **Feature 2: Connect Source + CSV Import** (adds the CSV flow, creates dropdown-menu primitive needed by Feature 3)
3. **Feature 3: Add Contact Gateway** (depends on dropdown-menu from Feature 2)
4. **Feature 4: Contact Lists** (independent but largest scope, saved for last)

## Summary of All New Files

| # | File | Feature |
|---|------|---------|
| 1 | `src/components/ui/dropdown-menu.tsx` | F2, F3 |
| 2 | `src/components/contacts/csv-import-modal.tsx` | F2 |
| 3 | `src/app/api/contacts/import-csv/route.ts` | F2 |
| 4 | `src/components/contacts/import-from-source-modal.tsx` | F3 |
| 5 | `src/components/contacts/source-list-panel.tsx` | F3 |
| 6 | `src/components/contacts/source-contact-selector.tsx` | F3 |
| 7 | `src/app/api/notion/connect/[id]/preview/route.ts` | F3 |
| 8 | `src/app/api/notion/connect/[id]/import-selected/route.ts` | F3 |
| 9 | `src/app/api/lists/route.ts` | F4 |
| 10 | `src/app/api/lists/[id]/route.ts` | F4 |
| 11 | `src/app/api/lists/[id]/members/route.ts` | F4 |
| 12 | `src/components/lists/lists-page.tsx` | F4 |
| 13 | `src/components/lists/create-list-modal.tsx` | F4 |
| 14 | `src/components/lists/list-detail-view.tsx` | F4 |
| 15 | `src/components/lists/list-section.tsx` | F4 |

## Summary of All Modified Files

| # | File | Features |
|---|------|----------|
| 1 | `src/components/contacts/contacts-page.tsx` | F1, F2, F3 |
| 2 | `src/components/contacts/contacts-table.tsx` | F1 |
| 3 | `src/components/contacts/contacts-toolbar.tsx` | F2, F3 |
| 4 | `src/lib/db/schema.sql` | F4 |
| 5 | `src/lib/db/client.ts` | F4 |
| 6 | `src/app/dashboard/page.tsx` | F4 |
| 7 | `src/components/messages/contact-selector.tsx` | F4 |
