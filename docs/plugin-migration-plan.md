# Notion CRM Connector → Claude Code Plugin Migration Plan

## Context

The current Notion CRM Connector is a full Next.js web application (Next.js 15, SQLite, React, shadcn/ui) that provides CRM functionality integrated with Notion. The goal is to **completely eliminate the Next.js app** and convert all functionality into a **Claude Code plugin** that users install and use entirely within Claude Desktop (Co-work tab) or Claude Code CLI. This analysis maps every feature to plugin primitives, identifies UX gaps, and proposes solutions including the Playground plugin for visual workflows.

---

## Current Architecture Summary

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | Next.js 15 + React + shadcn/ui | 8-tab dashboard UI |
| Backend API | Next.js API routes (27 endpoints) | CRUD, sync, messaging |
| Database | SQLite (better-sqlite3) | Local contact/template/activity store |
| Notion Integration | HTTP client + OAuth | CRM creation, sync, field mapping |
| MCP Server | `mcp-server/` (26 tools) | AI-powered CRM operations on Notion |
| Messaging | Template engine + prompt generation | SMS/WhatsApp via Claude Desktop |

---

## Feature-to-Plugin Primitive Mapping

### Legend
- ✅ **Clean fit** — maps naturally to plugin primitive
- ⚠️ **Needs adaptation** — possible but requires creative mapping
- 🔴 **Hard/Impossible via prompt UI** — needs Playground or alternative approach

---

### 1. Notion CRM Operations (26 MCP Tools)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Contact CRUD (create, search, count) | MCP tools + API routes | **MCP Server** (`.mcp.json`) | ✅ Reuse existing `mcp-server/` as-is. Already works with Claude Desktop. |
| Account CRUD (create, search, count) | MCP tools | **MCP Server** | ✅ Already MCP-native. No changes needed. |
| Opportunity CRUD (create, search, update, delete) | MCP tools | **MCP Server** | ✅ Already MCP-native. No changes needed. |
| Relationships (link contact→account, contact→opportunity, champion) | MCP tools | **MCP Server** | ✅ Already MCP-native. No changes needed. |
| Activities (create, search, update, get for contact) | MCP tools | **MCP Server** | ✅ Already MCP-native. No changes needed. |
| Pipeline Intelligence (analytics, conversion, revenue, scoring) | MCP tools | **MCP Server** | ✅ Already MCP-native. No changes needed. |
| Setup Activities DB | MCP tool | **MCP Server** | ✅ Already MCP-native. |

**Summary**: The 26 MCP tools are the backbone and already work as a standalone MCP server. The plugin bundles this server via `.mcp.json` so it auto-starts when the plugin is installed.

---

### 2. CRM Builder (Schema → Notion Databases)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Default CRM schema (Accounts, Contacts, Opportunities) | `src/lib/schema/default-schema.ts` | **Skill** (`/create-crm`) | ✅ Skill with embedded schema. User says `/create-crm` and Claude creates the 3-phase pipeline. |
| Real Estate schema variant | `src/lib/schema/default-schema.ts` | **Skill** (`/create-crm real-estate`) | ✅ Schema variant passed as `$ARGUMENTS`. |
| Schema customization (add/remove/edit properties before creation) | React SchemaEditor + SchemaTree components | **Playground** 🔴 | Schema tree editing is deeply visual. Generate a Playground HTML where user can toggle properties, rename fields, adjust select options, then copy the finalized schema JSON back. |
| Parent page selection | React dialog + Notion API search | **Skill** (prompt-driven) | ⚠️ Skill lists available pages via MCP, user picks by name/number. Less visual but functional. |
| SSE streaming progress | `useCreationStream()` hook + SSE endpoint | **Skill** (sequential output) | ⚠️ Claude can report progress step-by-step as it executes. No real-time progress bar, but textual updates work. |

---

### 3. Contact Management (Local SQLite)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Add contact | POST `/api/contacts` + AddContactModal | **MCP Server** (new tool) | ✅ Add `create_local_contact` MCP tool. User says "add contact John Doe, john@acme.com". |
| Edit contact | PUT `/api/contacts/[id]` + EditContactModal | **MCP Server** (new tool) | ✅ Add `update_local_contact` MCP tool. Conversational edit. |
| Delete contact | DELETE `/api/contacts/[id]` | **MCP Server** (new tool) | ✅ Add `delete_local_contact` MCP tool. |
| Search contacts | GET `/api/contacts?search=...` | **MCP Server** (new tool) | ✅ Add `search_local_contacts` MCP tool with search/filter/pagination. |
| View contact detail | ContactDetailModal | **MCP Server** (new tool) | ✅ Add `get_local_contact` tool. Claude formats the detail as text. |
| Bulk delete | POST `/api/contacts/bulk-delete` | **MCP Server** (new tool) | ⚠️ Add `bulk_delete_local_contacts` tool. User specifies IDs or criteria. |
| CSV import | POST `/api/contacts/import-csv` + CSVImportModal | **MCP Server** (new tool) + **Skill** | ✅ Add `import_csv_contacts` tool. Skill `/import-contacts` reads a CSV file path, parses it, maps columns, and imports. |
| Notion import/sync | POST `/api/notion/connect` + field mapping UI | **MCP Server** (new tool) + **Skill** | ⚠️ Add `connect_notion_database` and `sync_notion_contacts` tools. Field mapping done conversationally ("map Name to contact_name, Email to email..."). |
| Contact table view (paginated, filterable) | ContactsTable component | **MCP Server** (tool output) | ⚠️ Tool returns formatted table. No persistent visual table, but Claude can display results in markdown tables. |
| Bulk select for operations | Checkbox UI in ContactsTable | **Prompt UI limitation** 🔴 | See "Playground Solutions" below. For simple cases, user can say "select all contacts from Acme Corp" and Claude filters by criteria. |

---

### 4. Contact Lists

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Create list | POST `/api/lists` + CreateListModal | **MCP Server** (new tool) | ✅ `create_contact_list` tool. |
| View lists | GET `/api/lists` | **MCP Server** (new tool) | ✅ `list_contact_lists` tool. |
| Add members to list | POST `/api/lists/[id]/members` | **MCP Server** (new tool) | ✅ `add_to_list` tool. User says "add all Acme contacts to the Enterprise list". |
| Remove members | DELETE `/api/lists/[id]/members` | **MCP Server** (new tool) | ✅ `remove_from_list` tool. |
| View list members | GET `/api/lists/[id]` | **MCP Server** (new tool) | ✅ `get_list_members` tool. |
| Delete list | DELETE `/api/lists/[id]` | **MCP Server** (new tool) | ✅ `delete_contact_list` tool. |

---

### 5. Message Templates

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| View all templates | GET `/api/templates` | **MCP Server** (new tool) | ✅ `list_templates` tool. |
| Create template | POST `/api/templates` + TemplateEditor | **Playground** 🔴 + **MCP Server** | Template authoring with variable insertion (`{{first_name}}`, `{{company}}`) benefits from a visual editor. Generate a Playground HTML with a text editor, variable buttons, and live preview. Also support conversational creation via MCP tool. |
| Edit template | PUT `/api/templates/[id]` + TemplateEditor | **Playground** 🔴 + **MCP Server** | Same as create — Playground for visual editing, MCP tool for conversational. |
| Delete template | DELETE `/api/templates/[id]` | **MCP Server** (new tool) | ✅ `delete_template` tool. |
| Variable substitution engine | `src/lib/templates/parser.ts` | **MCP Server** (embedded logic) | ✅ Port `extractVariables()`, `replaceVariables()`, `enhanceContactData()` into MCP server. |

---

### 6. SMS/WhatsApp Messaging Workflow

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| 3-step wizard (template → contacts → review & send) | SendMessageFlowStepper (React) | **Skill** (`/send-sms`, `/send-whatsapp`) | ⚠️ Skill walks through steps conversationally. Claude asks "which template?", then "which contacts/list?", then generates the send prompt. |
| Template selection (Step 1) | TemplateSelectorCards component | **Skill** (conversational) | ✅ Skill lists templates, user picks by name/number. |
| Contact selection for bulk messaging (Step 2) | ContactSelector component with checkboxes | **Playground** 🔴 | Selecting specific contacts from a large list via checkboxes is inherently visual. Options: (a) Playground with interactive contact table + checkboxes, (b) use lists ("send to Enterprise list"), (c) criteria-based ("send to all contacts with phone numbers from Acme Corp"). |
| Message preview carousel (Step 2-3) | MessagePreviewCarousel component | **Skill** (text output) | ⚠️ Claude can show a few sample resolved messages in text. No carousel, but functional. |
| Prompt generation for Claude Desktop | PromptGeneratorEnhanced component | **Skill** (direct execution) 🎯 | ✅ **Major improvement**: Instead of generating a prompt to paste into Claude Desktop, the plugin IS Claude Desktop. The skill can directly invoke iMessage/WhatsApp MCP tools to send messages. No copy-paste needed. |
| Activity logging after send | POST `/api/activities/log-sms` | **MCP Server** (tool) | ✅ `log_messaging_activity` tool that writes to local DB and syncs to Notion. |
| Channel config (SMS vs WhatsApp) | `src/lib/templates/channels.ts` | **Skill** arguments | ✅ `/send-sms` vs `/send-whatsapp` as separate skills, or `/send-message sms` with argument. |

---

### 7. Notion Integration & Configuration

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Notion OAuth authentication | Manual OAuth flow in `src/lib/auth/` | **Plugin setup** + **Hook** | ⚠️ Plugin uses Notion API key (internal integration) instead of OAuth. The MCP server already supports this via `NOTION_API_KEY` env var. A `SessionStart` hook can verify the key is set. |
| Connect Notion database | POST `/api/notion/connect` + field mapping UI | **Skill** (`/connect-notion`) | ⚠️ Conversational: "Which Notion database?" → list databases → "How should I map fields?" → user confirms. |
| Database field schema display | GET `/api/notion/database-schema` | **MCP Server** (tool) | ✅ Tool fetches and displays schema. |
| MCP status dashboard | MCPConnectPage component | **Skill** (`/crm-status`) | ✅ Skill checks MCP connectivity, lists connected databases, shows field counts. |
| Sync connected databases | POST `/api/notion/connect/[id]/sync` | **MCP Server** (tool) | ✅ `sync_notion_database` tool. |

---

### 8. Authentication & Session

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Notion OAuth (production) | JWE encrypted cookies, token refresh | **Eliminated** | ✅ Plugin uses `NOTION_API_KEY` env var (internal integration token). No OAuth needed — simpler for end users. |
| Session management | Cookie-based sessions | **Eliminated** | ✅ MCP server is stateless per-request; Notion API key persists in env. |
| Dev mode | Skip OAuth, use API key | **Default mode** | ✅ This becomes the only mode. |

---

## Playground Plugin Solutions for Hard UX Problems

### Problem 1: Template Authoring & Editing 🔴

**Why it's hard in prompt UI**: Writing message templates with `{{variable}}` placeholders benefits from seeing the template rendered in real-time, having quick-insert buttons for common variables, and validating that all variables will resolve.

**Playground Solution**: The `/edit-template` skill generates a Playground HTML with:
- Left panel: Text editor with the template content
- Variable quick-insert buttons: `{{contact_name}}`, `{{first_name}}`, `{{company}}`, etc.
- Right panel: Live preview showing the template with sample contact data substituted
- Bottom: Generated JSON output that the skill reads back to create/update the template via MCP tool

**Flow**:
1. User: `/edit-template Follow-up Meeting`
2. Claude generates Playground HTML, opens in browser
3. User edits template visually, clicks "Copy Output"
4. User pastes output back into Claude
5. Claude saves via MCP tool

### Problem 2: Contact Selection for Bulk Messaging 🔴

**Why it's hard in prompt UI**: Selecting 15 specific contacts out of 200 by typing names is tedious and error-prone. The current app uses a checkbox table with search.

**Playground Solution**: The `/select-contacts` skill generates a Playground HTML with:
- Searchable, sortable contact table with checkboxes
- Filter controls (by source, company, list membership)
- Selected contacts summary panel
- Bottom: Generated output listing selected contact IDs

**Alternative approaches** (no Playground):
- **List-based**: "Send to the Enterprise Prospects list" — pre-curated lists make selection trivial
- **Criteria-based**: "Send to all contacts at Acme Corp who have phone numbers" — Claude filters via MCP tool
- **Confirmation-based**: Claude shows matching contacts, user says "yes" or "remove John, add Sarah"

**Recommendation**: Support all three approaches. Playground for power users who want visual selection; lists and criteria for the common case.

### Problem 3: Schema Customization 🔴

**Why it's hard in prompt UI**: The current schema editor is a tree view where users toggle properties, edit names, adjust select options across 3 databases with 30+ properties each.

**Playground Solution**: Generate a Playground HTML with:
- Tree view of databases and their properties
- Toggle switches to include/exclude properties
- Inline editing for property names and select options
- Preview of the Notion database structure
- Bottom: Finalized schema JSON

**Alternative**: For simpler cases, conversational customization works: "Remove the LinkedIn field from Contacts, add a 'Region' select with East/West/Central options."

### Problem 4: CSV Import Column Mapping 🔴

**Why it's hard in prompt UI**: Mapping CSV columns to contact fields requires seeing a preview of the data and confirming the mapping.

**Playground Solution**: Generate a Playground HTML with:
- CSV preview table (first 5 rows)
- Dropdown mapping for each CSV column → contact field
- Preview of how contacts will be created

**Alternative**: Claude can read the CSV file, show a sample, and propose a mapping: "I see columns Name, Email, Phone, Company. I'll map them to contact_name, email, phone, company. Does that look right?"

---

## Design Decisions

- **Auth**: `NOTION_API_KEY` env var (internal integration token). No OAuth.
- **MCP Servers**: Single merged server (~41 tools). Notion CRM tools + local SQLite tools in one process.
- **Primary Client**: Claude Desktop Co-work tab. Skills optimized for conversational Co-work UX.

---

## Proposed Plugin Directory Structure

```
notion-crm-plugin/
├── .claude-plugin/
│   └── plugin.json                    # Plugin manifest
├── skills/
│   ├── create-crm/
│   │   └── SKILL.md                   # /create-crm - Build CRM in Notion
│   ├── send-sms/
│   │   └── SKILL.md                   # /send-sms - SMS messaging workflow
│   ├── send-whatsapp/
│   │   └── SKILL.md                   # /send-whatsapp - WhatsApp messaging workflow
│   ├── import-contacts/
│   │   └── SKILL.md                   # /import-contacts - CSV/Notion import
│   ├── connect-notion/
│   │   └── SKILL.md                   # /connect-notion - Connect Notion DB
│   ├── crm-status/
│   │   └── SKILL.md                   # /crm-status - Check system status
│   ├── manage-templates/
│   │   └── SKILL.md                   # /manage-templates - Template CRUD
│   ├── bulk-message/
│   │   └── SKILL.md                   # /bulk-message - Bulk send workflow
│   └── setup/
│       └── SKILL.md                   # /setup - First-time configuration
├── agents/
│   └── crm-assistant.md               # CRM-aware subagent with persistent memory
├── hooks/
│   └── hooks.json                     # SessionStart: verify config, show status
├── .mcp.json                          # Single MCP server config
├── mcp-server/                        # Single merged MCP server (~41 tools)
│   ├── src/
│   │   ├── index.ts                   # Entry: registers all tool groups
│   │   ├── tools/
│   │   │   ├── contacts.ts            # Notion contact CRUD (existing)
│   │   │   ├── accounts.ts            # Notion account CRUD (existing)
│   │   │   ├── opportunities.ts       # Notion opportunity CRUD (existing)
│   │   │   ├── relationships.ts       # Notion relationship tools (existing)
│   │   │   ├── pipeline.ts            # Pipeline analytics (existing)
│   │   │   ├── activities.ts          # Notion activity tools (existing)
│   │   │   ├── intelligence.ts        # Analytics/scoring (existing)
│   │   │   ├── local-contacts.ts      # NEW: Local SQLite contact CRUD
│   │   │   ├── local-lists.ts         # NEW: Contact list management
│   │   │   ├── local-templates.ts     # NEW: Message template CRUD
│   │   │   ├── local-activities.ts    # NEW: Activity logging + dual-write
│   │   │   └── local-import.ts        # NEW: CSV import, Notion DB sync
│   │   ├── operations/                # Existing Notion query/create ops
│   │   ├── utils/                     # Existing formatters, validators
│   │   ├── db/
│   │   │   ├── client.ts             # Port from src/lib/db/client.ts
│   │   │   └── schema.sql            # Port from src/lib/db/schema.sql
│   │   └── templates/
│   │       └── parser.ts             # Port from src/lib/templates/parser.ts
│   ├── data/                          # SQLite DB + CRM schema JSON
│   └── package.json
├── scripts/
│   ├── setup.sh                       # Install deps, init DB, verify Notion key
│   └── verify-config.sh               # Check NOTION_API_KEY, DB exists
└── README.md
```

---

## MCP Server Architecture (Single Merged Server — ~41 tools)

One server process with all tools. Existing 26 Notion tools kept as-is, plus ~15 new local SQLite tools added to the same server. Tools can cross-reference each other (e.g., `log_messaging_activity` writes to local DB AND syncs to Notion Activities DB in one call).

### Existing Tools (26) — Reuse from `mcp-server/`
All contact, account, opportunity, relationship, pipeline, activity, and intelligence tools. No changes.

### New Tools (~15) — Port from Next.js API routes

| Tool | Source Code to Port |
|------|-------------------|
| `search_local_contacts` | `src/lib/db/client.ts` → `contactDB.getAll()` + `contactDB.search()` |
| `create_local_contact` | `src/lib/db/client.ts` → `contactDB.create()` |
| `update_local_contact` | `src/lib/db/client.ts` → `contactDB.update()` |
| `delete_local_contact` | `src/lib/db/client.ts` → `contactDB.delete()` |
| `bulk_delete_contacts` | `src/lib/db/client.ts` → loop `contactDB.delete()` |
| `import_csv_contacts` | `src/lib/db/client.ts` → `contactDB.createMany()` + CSV parsing |
| `list_templates` | `src/lib/db/client.ts` → `templateDB.getAll()` |
| `create_template` | `src/lib/db/client.ts` → `templateDB.create()` |
| `update_template` | `src/lib/db/client.ts` → `templateDB.update()` |
| `delete_template` | `src/lib/db/client.ts` → `templateDB.delete()` |
| `resolve_template` | `src/lib/templates/parser.ts` → `replaceVariables()` |
| `list_contact_lists` | `src/lib/db/client.ts` → `listDB.getAll()` |
| `create_contact_list` | `src/lib/db/client.ts` → `listDB.create()` |
| `manage_list_members` | `src/lib/db/client.ts` → `listDB.addMembers()` / `removeMembers()` |
| `log_messaging_activity` | `src/app/api/activities/log-sms/route.ts` — dual-write to local DB + Notion |
| `connect_notion_database` | `src/app/api/notion/connect/route.ts` logic |
| `sync_notion_contacts` | `src/app/api/notion/connect/[id]/sync/route.ts` logic |

---

## Skill Definitions (Summary)

### `/setup` — First-Time Configuration
```
Checks for NOTION_API_KEY, initializes SQLite DB, verifies MCP server connectivity.
Walks user through: get Notion integration token → set env var → test connection.
```

### `/create-crm` — Build CRM in Notion
```
Accepts optional schema type ($ARGUMENTS: "default" or "real-estate").
Uses embedded schema from default-schema.ts.
Executes 3-phase creation via Notion API calls through MCP tools.
Reports progress textually step-by-step.
```

### `/send-sms` and `/send-whatsapp` — Messaging Workflows
```
Conversational 3-step flow:
1. List templates, user picks one
2. User specifies contacts (by name, list, or criteria)
3. Claude resolves variables, shows preview, then DIRECTLY sends via iMessage/WhatsApp MCP
4. Logs activity to local DB + Notion

Key improvement: No more "copy prompt to Claude Desktop" — the plugin IS Claude Desktop.
```

### `/import-contacts` — CSV or Notion Import
```
Accepts file path or "notion" as argument.
CSV: Reads file, shows sample rows, proposes column mapping, imports.
Notion: Lists connected databases, fetches records, maps fields, imports.
```

### `/connect-notion` — Database Connection
```
Lists available Notion databases via API.
User picks one. Claude shows fields, proposes mapping.
User confirms. Connection saved to local DB.
```

### `/manage-templates` — Template CRUD
```
Lists templates. User can create/edit/delete.
For creation: Claude asks for name and content, supports {{variable}} syntax.
For visual editing: Suggests using Playground plugin.
```

### `/bulk-message` — Power User Bulk Send
```
Combines list selection + template + send in one flow.
Accepts arguments: /bulk-message "Enterprise Prospects" "Follow-up Template"
```

### `/crm-status` — System Health Check
```
Shows: Notion connection status, connected databases, local DB stats,
MCP server status, template count, contact count by source.
```

---

## Hooks Configuration

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/scripts/verify-config.sh"
          }
        ]
      }
    ]
  }
}
```

The `SessionStart` hook runs `verify-config.sh` which:
1. Checks if `NOTION_API_KEY` env var is set
2. Checks if SQLite DB exists and is initialized
3. Outputs status summary that gets injected into Claude's context
4. If not configured, outputs instructions for setup

---

## Agent Definition

### `crm-assistant.md`
```yaml
---
name: crm-assistant
description: CRM specialist that manages contacts, opportunities, and messaging campaigns. Delegates CRM tasks.
tools: Read, Bash, Glob, Grep
model: sonnet
memory: project
skills:
  - create-crm
  - send-sms
  - send-whatsapp
  - import-contacts
  - manage-templates
mcpServers:
  notion-crm:
---
```

With `memory: project`, the agent remembers user preferences, common contacts, frequently used templates across sessions. Single MCP server (`notion-crm`) contains all tools.

---

## What Gets Eliminated (No Longer Needed)

| Component | Why Eliminated |
|-----------|---------------|
| Next.js app (all React pages/components) | Replaced by skills + MCP tools + conversational UI |
| 27 API route handlers | Logic moves into MCP server tools |
| OAuth authentication | Replaced by simple `NOTION_API_KEY` env var |
| JWE session encryption | No sessions needed — MCP is stateless |
| shadcn/ui components | No visual UI in plugin |
| Tailwind CSS | No visual UI in plugin |
| SSE streaming endpoint | Progress reported textually by Claude |
| Middleware | No route protection needed |

---

## What Gets Significantly Improved

| Area | Before (Next.js App) | After (Plugin) |
|------|---------------------|----------------|
| **Message sending** | Generate prompt → copy → paste into Claude Desktop → wait | Direct execution via iMessage/WhatsApp MCP tools — one-step |
| **Installation** | `git clone` → `npm install` → configure env → `npm run dev` | `claude plugin install notion-crm` → set API key → done |
| **CRM queries** | Navigate to tab → use search UI → read results | "Show me all open opportunities over $50k" — natural language |
| **Multi-step workflows** | Click through multi-step wizard | Describe what you want, Claude handles the steps |
| **Pipeline intelligence** | Already MCP-native | Same, but now integrated into conversational context |
| **Updates** | `git pull` → rebuild | `claude plugin update notion-crm` |

---

## What Gets Worse (Trade-offs)

| Area | Impact | Mitigation |
|------|--------|------------|
| **Contact table browsing** | No persistent sortable/filterable table view | MCP tool returns paginated results; Playground for visual browsing |
| **Template visual editing** | No real-time WYSIWYG editor | Playground plugin generates interactive editor; or conversational authoring |
| **Bulk contact selection** | No checkbox multi-select UI | Lists, criteria-based selection, Playground for power users |
| **Schema tree editing** | No drag-and-drop tree editor | Playground or conversational customization |
| **Progress visualization** | No animated progress bars | Textual step-by-step updates from Claude |
| **At-a-glance dashboard** | No persistent status dashboard | `/crm-status` skill on demand |

---

## Implementation Order

### Phase 1: Plugin Scaffold + MCP Server Bundling
1. Create plugin directory structure
2. Write `plugin.json` manifest
3. Copy existing `mcp-server/` into plugin as `mcp-server/`
4. Write `.mcp.json` to register the single merged server
5. Write `hooks.json` with `SessionStart` config check
6. Write `scripts/verify-config.sh`
7. Write `/setup` skill

### Phase 2: Add Local SQLite Tools to MCP Server
1. Port `src/lib/db/client.ts` and `schema.sql` into `mcp-server/src/db/`
2. Port `src/lib/templates/parser.ts` into `mcp-server/src/templates/`
3. Add local contact tools (`local-contacts.ts`): CRUD, search, import
4. Add template tools (`local-templates.ts`): CRUD, variable resolution
5. Add list tools (`local-lists.ts`): CRUD, member management
6. Add activity tools (`local-activities.ts`): logging, dual-write to Notion
7. Add import tools (`local-import.ts`): CSV parsing, Notion DB sync
8. Register all new tools in `index.ts`

### Phase 3: Skills
1. Write `/create-crm` skill (embed schema, 3-phase creation logic)
2. Write `/send-sms` and `/send-whatsapp` skills
3. Write `/import-contacts` skill (CSV + Notion)
4. Write `/connect-notion` skill
5. Write `/manage-templates` skill
6. Write `/bulk-message` skill
7. Write `/crm-status` skill

### Phase 4: Agent + Memory
1. Write `crm-assistant.md` agent definition
2. Configure persistent memory for cross-session learning

### Phase 5: Playground Integrations
1. Extend `/manage-templates` to generate Playground HTML for template editing
2. Extend `/bulk-message` to generate Playground HTML for contact selection
3. Extend `/create-crm` to generate Playground HTML for schema customization

### Phase 6: Testing & Documentation
1. Test full installation flow
2. Test each skill end-to-end
3. Test MCP server tools individually
4. Write user-facing README with setup instructions

---

## Verification Plan

1. **Plugin installs cleanly**: `claude plugin install ./notion-crm-plugin` succeeds
2. **SessionStart hook**: New session shows config status
3. **`/setup`**: Walks through first-time configuration successfully
4. **MCP tools**: Single server starts; all ~41 tools (26 existing + 15 new) respond correctly
5. **`/create-crm`**: Creates 3 Notion databases with relations
6. **`/send-sms`**: Full flow from template selection to message delivery
7. **`/import-contacts`**: CSV file imports correctly
8. **`/connect-notion`**: Connects to Notion DB and imports contacts
9. **`/crm-status`**: Shows accurate system state
10. **Playground integrations**: HTML files generate and work in browser

---

## Key Files to Reuse From Current Codebase

| File | What to Reuse |
|------|---------------|
| `mcp-server/` (entire directory) | All 26 MCP tools, operations, utils — as-is |
| `src/lib/db/client.ts` | All SQLite CRUD operations — port to new MCP server |
| `src/lib/db/schema.sql` | Database schema — copy directly |
| `src/lib/templates/parser.ts` | Variable extraction/substitution engine — port to MCP |
| `src/lib/templates/channels.ts` | Channel configs — embed in skills |
| `src/lib/schema/default-schema.ts` | CRM schema definitions — embed in skill |
| `src/lib/notion/create-crm.ts` | 3-phase creation logic — port to skill/MCP |
| `src/lib/notion/rate-limiter.ts` | Rate limiting — reuse in MCP server |
| `src/lib/notion/client.ts` | Notion HTTP client — reuse in MCP server |
