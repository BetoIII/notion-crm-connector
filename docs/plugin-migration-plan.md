# Notion CRM Connector → Claude Code Plugin Migration Plan

## Context

The current Notion CRM Connector is a full Next.js web application (Next.js 15, SQLite, React, shadcn/ui) that provides CRM functionality integrated with Notion. The goal is to **completely eliminate the Next.js app** and convert all functionality into a **Claude Code plugin** that users install and use entirely within Claude Desktop (Co-work tab). This analysis maps every feature to plugin primitives, identifies UX gaps, and proposes solutions including the Playground plugin for visual workflows.

---

## Design Decisions

- **Auth**: `NOTION_API_KEY` env var (internal integration token). No OAuth.
- **Storage**: **Notion-only**. No SQLite. All data (contacts, templates, lists, activities) lives in the user's Notion workspace.
- **MCP Server**: Single merged server. All Notion CRM tools in one process.
- **Required Config**: Two env vars — `NOTION_API_KEY` + `NOTION_CRM_PAGE_ID` (parent page where all CRM databases live).
- **Primary Client**: Claude Desktop Co-work tab. Skills optimized for conversational Co-work UX.
- **Scope simplification**: Accounts/Companies database **removed**. CRM is Contact-centric. Company is a property on Contacts, not a separate database.

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

## New Notion Database Architecture

All databases live under a single **CRM Parent Page** (identified by `NOTION_CRM_PAGE_ID`). The plugin creates these databases on the user's behalf during `/setup`.

### Databases (4 total)

| Database | Purpose | Key Relations |
|----------|---------|---------------|
| **Contacts** | People, leads, decision-makers | → Lists (many-to-many), → Opportunities, → Activities |
| **Opportunities** | Sales pipeline and deals | → Contacts (Buying Committee), → Activities |
| **Lists** | **NEW** — Curated contact groups for campaigns | → Contacts (many-to-many) |
| **Activities** | Calls, emails, meetings, notes, tasks | → Contacts, → Opportunities |

### Lists Database Schema (NEW)

```
Lists
├── List Name (title)
├── Description (rich_text)
├── Type (select): Campaign, Segment, Event, Custom
├── Status (select): Active, Archived
├── 👥 Contacts (relation → Contacts, many-to-many)
├── Created Date (date)
└── Last Used (date)
```

The Lists database replaces the old SQLite `contact_lists` and `contact_list_members` tables. A List is simply a Notion page with a relation property pointing to multiple Contacts. This means:
- Lists are visible and editable directly in Notion
- Claude can query/filter lists via the Notion API
- Users can manage lists from Notion UI OR from the plugin
- The Playground can render an interactive list editor

### Contacts Database Schema (Simplified — no Company relation)

```
Contacts
├── Contact Name (title)
├── Title (rich_text)
├── Contact Email (email)
├── Contact Phone (phone_number)
├── Company (rich_text)              ← Simple text field, NOT a relation
├── LinkedIn (url)
├── Buying Role (select)
├── Engagement Level (select)
├── Source (multi_select)
├── Last Contact (date)
├── 📋 Lists (relation → Lists)     ← NEW: synced from Lists.👥 Contacts
├── 💼 Opportunities (relation → Opportunities)
└── 📋 Activities (relation → Activities)
```

### Templates Database Schema (NEW — replaces SQLite templates table)

```
Templates
├── Template Name (title)
├── Content (rich_text)              ← Template body with {{variable}} placeholders
├── Channel (select): SMS, WhatsApp, Both
├── Category (select): Follow-up, Introduction, Event, Custom
├── Variables (rich_text)            ← Auto-populated: "contact_name, first_name, company"
├── Times Used (number)
└── Last Used (date)
```

Templates now live in Notion, meaning:
- Users can view/edit templates directly in Notion
- Templates are backed up with the rest of the workspace
- No local state to lose or corrupt

---

## Feature-to-Plugin Primitive Mapping

### Legend
- ✅ **Clean fit** — maps naturally to plugin primitive
- ⚠️ **Needs adaptation** — possible but requires creative mapping
- 🔴 **Hard/Impossible via prompt UI** — needs Playground or alternative approach

---

### 1. Notion CRM Operations (MCP Tools)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Contact CRUD (create, search, update, get) | MCP tools | **MCP Server** | ✅ Keep existing tools, remove account auto-creation. Company becomes a text field. |
| Opportunity CRUD (create, search, update, delete) | MCP tools | **MCP Server** | ✅ Keep existing tools. Remove Account relation, keep Buying Committee → Contacts. |
| Activities (log, create task, add note, get history) | MCP tools | **MCP Server** | ✅ Keep existing tools. Remove Account relations. Activities relate to Contacts + Opportunities only. |
| Pipeline Intelligence (analytics, conversion, revenue, scoring) | MCP tools | **MCP Server** | ✅ Keep existing tools. Remove account-based analytics. |
| Relationships (link records) | MCP tools | **MCP Server** | ✅ Keep `link_records` tool. Remove `get_account_overview`. |

**Removed**:
- `create_account`, `search_accounts`, `update_account` — eliminated
- `get_account_overview` — eliminated
- Account relation on Activities — eliminated
- Account relation on Opportunities — eliminated

---

### 2. CRM Builder (Schema → Notion Databases)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Default CRM schema (Contacts, Opportunities, Lists, Activities, Templates) | `default-schema.ts` | **Skill** (`/setup`) | ✅ `/setup` creates all 5 databases under `NOTION_CRM_PAGE_ID`. No Accounts. Adds Lists + Templates databases. |
| Schema customization | React SchemaEditor | **Playground** 🔴 | Generate Playground HTML for property toggling. Or conversational: "add a Region select to Contacts". |
| Parent page selection | React dialog | **Config value** | ✅ User provides `NOTION_CRM_PAGE_ID` during setup. Extracted from URL like `83a0ac85cdd3464c92083b1336f7bfe7`. |
| SSE streaming progress | `useCreationStream()` | **Skill** (sequential output) | ⚠️ Claude reports progress step-by-step textually. |

---

### 3. Contact Management (Now 100% Notion)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Add contact | SQLite + API route | **MCP Server** (existing `create_contact`) | ✅ Already exists. Remove auto-account creation. Company is a text field. |
| Edit contact | SQLite + API route | **MCP Server** (existing `update_contact`) | ✅ Already exists. |
| Delete contact | SQLite + API route | **MCP Server** (Notion archive) | ✅ Archive Notion page. |
| Search contacts | SQLite + API route | **MCP Server** (existing `search_contacts`) | ✅ Already exists. |
| View contact detail | SQLite + modal | **MCP Server** (existing `get_contact`) | ✅ Already exists. |
| CSV import | SQLite + API route | **MCP Server** (new `import_csv_to_notion`) + **Skill** | ⚠️ New tool reads CSV, creates Notion pages. Skill `/import-contacts` handles column mapping conversationally. |
| Contact table view | React component | **MCP Server** (tool output) | ⚠️ Tool returns markdown table. Or users view in Notion directly. |
| Bulk select for operations | Checkbox UI | **Lists** + **Playground** 🔴 | Users pre-curate Lists, then operate on Lists. Playground for visual selection when needed. |

---

### 4. Contact Lists (NEW — Notion Database)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Create list | SQLite `contact_lists` table | **MCP Server** (new `create_list`) | ✅ Creates a page in Lists database. |
| View all lists | SQLite query | **MCP Server** (new `search_lists`) | ✅ Queries Lists database. |
| Add contacts to list | SQLite junction table | **MCP Server** (new `add_contacts_to_list`) | ✅ Appends to the `👥 Contacts` relation property. |
| Remove contacts from list | SQLite junction table | **MCP Server** (new `remove_contacts_from_list`) | ✅ Removes from relation property. |
| View list members | SQLite join query | **MCP Server** (new `get_list_members`) | ✅ Reads the `👥 Contacts` relation and fetches linked contacts. |
| Delete list | SQLite delete | **MCP Server** (Notion archive) | ✅ Archives the list page. |
| **Visual list management** | N/A (new) | **Playground** 🔴 | Playground HTML with contact table + checkboxes + drag to list. See Playground section. |

---

### 5. Message Templates (NEW — Notion Database)

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| View all templates | SQLite query | **MCP Server** (new `search_templates`) | ✅ Queries Templates database. |
| Create template | SQLite insert + TemplateEditor | **MCP Server** (new `create_template`) + **Playground** 🔴 | Create via MCP tool conversationally, or via Playground for visual editing with variable buttons + live preview. |
| Edit template | SQLite update + TemplateEditor | **MCP Server** (new `update_template`) + **Playground** 🔴 | Same dual approach. |
| Delete template | SQLite delete | **MCP Server** (Notion archive) | ✅ Archives the template page. |
| Variable substitution engine | `src/lib/templates/parser.ts` | **MCP Server** (new `resolve_template`) | ✅ Port `extractVariables()`, `replaceVariables()`, `enhanceContactData()` into MCP server. |

---

### 6. SMS/WhatsApp Messaging Workflow

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| 3-step wizard (template → contacts → review & send) | React stepper | **Skill** (`/send-sms`, `/send-whatsapp`) | ⚠️ Conversational flow. Claude asks "which template?", then "which list/contacts?", resolves variables, sends. |
| Template selection (Step 1) | React cards | **Skill** (conversational) | ✅ Claude queries Templates DB, presents options, user picks by name/number. |
| Contact selection (Step 2) | React checkboxes | **Lists** + **Playground** 🔴 | **Primary path**: "Send to the Enterprise Prospects list". Lists make selection trivial. **Power user path**: Playground for custom selection. **Fallback**: criteria-based ("send to all contacts from Acme Corp"). |
| Message preview (Step 2-3) | React carousel | **Skill** (text output) | ⚠️ Claude shows a few resolved message samples. No carousel, but functional. |
| Prompt generation for Claude Desktop | PromptGeneratorEnhanced | **Skill** (direct execution) 🎯 | ✅ **Major improvement**: Plugin IS Claude Desktop. Skill directly invokes iMessage/WhatsApp MCP to send. No copy-paste. |
| Activity logging after send | SQLite + API route | **MCP Server** (existing `log_activity`) | ✅ Logs to Notion Activities DB with Contact relation. |
| Channel config (SMS vs WhatsApp) | `channels.ts` | **Skill** arguments | ✅ `/send-sms` vs `/send-whatsapp` as separate skills. |

---

### 7. Configuration

| Feature | Current Implementation | Plugin Primitive | Migration Strategy |
|---------|----------------------|------------------|--------------------|
| Notion OAuth | Full OAuth flow | **Eliminated** | ✅ `NOTION_API_KEY` env var. Users create a Notion internal integration. |
| Session management | Cookies + JWE | **Eliminated** | ✅ MCP server is stateless. API key persists in env. |
| CRM Parent Page | Hardcoded or selected in UI | **`NOTION_CRM_PAGE_ID` env var** | ✅ User provides the page ID from their Notion URL. All databases created under this page. |
| Database discovery | API routes + field mapping UI | **MCP Server** (auto-discovery) | ✅ MCP server reads `NOTION_CRM_PAGE_ID` children to find Contacts, Lists, Templates, etc. Schema file maps DB IDs. |
| MCP status dashboard | React component | **Skill** (`/crm-status`) | ✅ Checks connectivity, lists databases, shows counts. |

---

## Playground Plugin Solutions for Hard UX Problems

### Problem 1: List Management (Add/Remove Contacts from Lists) 🔴

**Why it's hard in prompt UI**: Managing a list of 50+ contacts — seeing who's in, who's out, searching/filtering, multi-selecting — is fundamentally a visual, spatial task. Typing "add John, Sarah, Mike, Lisa, and 12 others" is tedious and error-prone.

**Playground Solution**: The `/manage-list` skill generates a Playground HTML with:
- **Left panel**: All contacts table with search, filter by company/source/engagement
- **Right panel**: Current list members
- **Controls**: Checkboxes to add/remove, drag between panels
- **Bottom**: Generated JSON output with `{ listId, addContactIds: [...], removeContactIds: [...] }`

**Flow**:
1. User: `/manage-list Enterprise Prospects`
2. Claude fetches all contacts + current list members from Notion via MCP
3. Claude generates Playground HTML with the data embedded, writes to file, opens in browser
4. User visually manages the list, clicks "Copy Output"
5. User pastes output back into Claude
6. Claude applies changes via MCP tools (add/remove contacts from list relation)

**Alternative (no Playground)**:
- "Add all contacts from Acme Corp to the Enterprise Prospects list"
- "Show me who's on the Enterprise Prospects list" → Claude shows table → "Remove Sarah and add Mike"
- Criteria-based: "Create a list of all Hot contacts with phone numbers"

### Problem 2: Contact Selection for Bulk Messaging 🔴

**Why it's hard in prompt UI**: Selecting 15 specific contacts out of 200 by typing names is tedious and error-prone.

**Playground Solution**: Same as list management — generate Playground HTML with contact table + checkboxes. But the key insight is: **Lists solve this problem architecturally**. If users maintain lists, they just say "send to my Enterprise Prospects list" and selection is done.

**Recommended flow**:
1. User maintains Lists in Notion or via `/manage-list`
2. `/send-sms Enterprise Prospects` uses the list directly
3. Playground only needed for ad-hoc one-off selections

### Problem 3: Template Authoring & Editing 🔴

**Why it's hard in prompt UI**: Writing templates with `{{variable}}` placeholders benefits from real-time preview, quick-insert buttons, and variable validation.

**Playground Solution**: The `/edit-template` skill generates a Playground HTML with:
- Left panel: Text editor with template content
- Variable quick-insert buttons: `{{contact_name}}`, `{{first_name}}`, `{{company}}`, etc.
- Right panel: Live preview with sample contact data substituted
- Bottom: Generated JSON output `{ name, content, channel, category }`

**Flow**:
1. User: `/edit-template Follow-up Meeting`
2. Claude fetches template from Notion via MCP (or starts blank for new)
3. Claude generates Playground HTML, opens in browser
4. User edits visually, clicks "Copy Output"
5. User pastes back, Claude saves to Notion Templates DB

**Alternative (no Playground)**:
- Conversational: "Create a template called 'Follow-up' for SMS that says: Hi {{first_name}}, great meeting you at {{event}}. Let's connect this week!"
- Claude validates variables exist, saves to Notion

### Problem 4: CSV Import Column Mapping 🔴

**Why it's hard in prompt UI**: Mapping CSV columns to contact fields needs data preview.

**Playground Solution**: Generate Playground HTML with CSV preview + dropdown mapping.

**Alternative**: Claude reads the CSV, shows sample rows, proposes mapping: "I see columns Name, Email, Phone, Company. I'll map them to Contact Name, Contact Email, Contact Phone, Company. Sound good?"

---

## Proposed Plugin Directory Structure

```
notion-crm-plugin/
├── .claude-plugin/
│   └── plugin.json                    # Plugin manifest
├── skills/
│   ├── setup/
│   │   └── SKILL.md                   # /setup - First-time config + DB creation
│   ├── create-crm/
│   │   └── SKILL.md                   # /create-crm - Build CRM databases in Notion
│   ├── send-sms/
│   │   └── SKILL.md                   # /send-sms - SMS messaging workflow
│   ├── send-whatsapp/
│   │   └── SKILL.md                   # /send-whatsapp - WhatsApp messaging workflow
│   ├── import-contacts/
│   │   └── SKILL.md                   # /import-contacts - CSV import to Notion
│   ├── manage-templates/
│   │   └── SKILL.md                   # /manage-templates - Template CRUD
│   ├── manage-list/
│   │   └── SKILL.md                   # /manage-list - Visual list management
│   ├── bulk-message/
│   │   └── SKILL.md                   # /bulk-message - List + template + send
│   └── crm-status/
│       └── SKILL.md                   # /crm-status - System health check
├── agents/
│   └── crm-assistant.md               # CRM-aware subagent with persistent memory
├── hooks/
│   └── hooks.json                     # SessionStart: verify config
├── .mcp.json                          # Single MCP server config
├── mcp-server/                        # Single MCP server (all Notion tools)
│   ├── src/
│   │   ├── index.ts                   # Entry: registers all tool groups
│   │   ├── tools/
│   │   │   ├── contacts.ts            # Contact CRUD (simplified, no account link)
│   │   │   ├── opportunities.ts       # Opportunity CRUD (no account link)
│   │   │   ├── relationships.ts       # link_records (generic)
│   │   │   ├── pipeline.ts            # Pipeline analytics
│   │   │   ├── activities.ts          # Activity tools (no account link)
│   │   │   ├── intelligence.ts        # Analytics/scoring
│   │   │   ├── lists.ts              # NEW: List CRUD + member management
│   │   │   ├── templates.ts          # NEW: Template CRUD + variable resolution
│   │   │   └── import.ts            # NEW: CSV import to Notion
│   │   ├── operations/                # Existing Notion query/create/update/link ops
│   │   ├── utils/                     # Existing formatters, validators, date utils
│   │   ├── schema/                    # Schema loader/validator
│   │   └── templates/
│   │       └── parser.ts             # Port from src/lib/templates/parser.ts
│   └── package.json
├── scripts/
│   ├── setup.sh                       # Install deps, verify env vars
│   └── verify-config.sh               # Check NOTION_API_KEY + NOTION_CRM_PAGE_ID
└── README.md
```

---

## MCP Server Architecture (Single Server)

One server process with all tools. Existing Notion tools refactored (remove Account references), plus new List/Template/Import tools.

### Retained Tools (Modified — remove Account references)

| Tool | Changes |
|------|---------|
| `create_contact` | Remove `company` auto-account creation. Company becomes a text property. |
| `search_contacts` | No changes needed. |
| `update_contact` | No changes needed. |
| `get_contact` | No changes needed. |
| `create_opportunity` | Remove Account relation. Keep Buying Committee → Contacts. |
| `search_opportunities` | Remove account-based filtering. |
| `update_opportunity` | Remove account fields. |
| `delete_opportunity` | No changes needed. |
| `link_records` | Keep as generic relation linker. |
| `log_activity` | Remove account_name/account_id params. Link to Contact + Opportunity only. |
| `create_task` | Remove account params. |
| `add_note` | Remove account params. |
| `get_activity_history` | Remove account-based filtering. |
| `setup_activities_database` | Remove Account relation. Use `NOTION_CRM_PAGE_ID` as parent. |
| `pipeline_analytics` | Remove account-based analytics. |
| `conversion_analysis` | No changes needed. |
| `revenue_intelligence` | Remove account-level revenue. |
| `contact_scoring` | No changes needed. |
| `pipeline_forecast` | No changes needed. |
| `deal_risk_analysis` | Remove account context. |

### Removed Tools

| Tool | Why |
|------|-----|
| `create_account` | No Accounts database. |
| `search_accounts` | No Accounts database. |
| `update_account` | No Accounts database. |
| `get_account_overview` | No Accounts database. |

### New Tools

| Tool | Purpose |
|------|---------|
| `create_list` | Create a new List in Notion with name, description, type. |
| `search_lists` | Search/filter Lists by name, type, status. |
| `get_list_members` | Get all contacts in a specific list. |
| `add_contacts_to_list` | Append contact IDs to a list's relation property. |
| `remove_contacts_from_list` | Remove contact IDs from a list's relation. |
| `archive_list` | Archive a list page. |
| `create_template` | Create a Template page in Notion. |
| `search_templates` | Search/filter Templates by name, channel, category. |
| `update_template` | Update template content/metadata. |
| `archive_template` | Archive a template page. |
| `resolve_template` | Resolve `{{variables}}` against a contact's data. Returns rendered message. |
| `resolve_template_for_list` | Resolve template for all contacts in a list. Returns array of rendered messages. |
| `import_csv_to_notion` | Parse CSV file, create Contact pages in Notion. |
| `setup_lists_database` | Create Lists database under CRM parent page. |
| `setup_templates_database` | Create Templates database under CRM parent page. |

---

## Skill Definitions (Summary)

### `/setup` — First-Time Configuration
```
Required env vars: NOTION_API_KEY, NOTION_CRM_PAGE_ID
Steps:
1. Verify NOTION_API_KEY is set and valid (test API call)
2. Accept NOTION_CRM_PAGE_ID from user (extract ID from Notion URL)
3. Check if CRM databases exist under parent page
4. If not, offer to create them: Contacts, Opportunities, Lists, Templates, Activities
5. Save schema mapping (database IDs → keys) to schema.json
6. Confirm setup complete with status summary

User provides their Notion page URL like:
https://www.notion.so/CRM-Parent-Page-83a0ac85cdd3464c92083b1336f7bfe7
Plugin extracts: 83a0ac85cdd3464c92083b1336f7bfe7
```

### `/create-crm` — Build CRM Databases
```
Creates all 5 databases under NOTION_CRM_PAGE_ID:
1. Contacts (with all properties + relation stubs)
2. Opportunities (with pipeline stages + Contact relations)
3. Lists (with Contact many-to-many relation)
4. Templates (with content + variables + channel)
5. Activities (with Contact + Opportunity relations)
Sets up cross-database relations after all DBs exist.
Reports progress step-by-step.
```

### `/send-sms` and `/send-whatsapp` — Messaging Workflows
```
Conversational 3-step flow:
1. List templates from Notion, user picks one
2. User specifies list name OR contact criteria
3. Claude resolves variables per contact, shows preview, DIRECTLY sends via iMessage/WhatsApp MCP
4. Logs activity to Notion Activities DB per contact
5. Updates template "Times Used" and "Last Used"

Key improvement: Plugin IS Claude Desktop. No copy-paste prompt generation.
```

### `/import-contacts` — CSV Import to Notion
```
Accepts file path as argument.
1. Read CSV file, show first 5 rows as sample
2. Propose column mapping: CSV column → Notion property
3. User confirms or adjusts
4. Create Contact pages in Notion (with rate limiting)
5. Optionally add imported contacts to a List
```

### `/manage-templates` — Template CRUD
```
Lists templates from Notion. User can:
- View all: Claude queries Templates DB, shows table
- Create: conversational ("name it X, content is Y, channel is SMS")
- Edit: conversational or Playground for visual editing
- Delete: archive in Notion
Supports {{variable}} syntax with validation.
```

### `/manage-list` — Visual List Management
```
Primary path: Generate Playground HTML for visual contact ↔ list management.
Fallback: Conversational ("add all Hot contacts to the Conference Follow-ups list").
Arguments: /manage-list [list-name]
```

### `/bulk-message` — Power User Bulk Send
```
One-shot: /bulk-message "Enterprise Prospects" "Follow-up Template" sms
Expands to full send-sms flow with list and template pre-selected.
```

### `/crm-status` — System Health Check
```
Shows:
- Notion connection status (API key valid?)
- CRM Parent Page accessible?
- Database inventory: Contacts (N), Opportunities (N), Lists (N), Templates (N), Activities (N)
- MCP server status
- Missing databases (if any)
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
2. Checks if `NOTION_CRM_PAGE_ID` env var is set
3. Outputs status summary injected into Claude's context
4. If not configured, outputs: "Run /setup to configure your CRM"

---

## Agent Definition

### `crm-assistant.md`
```yaml
---
name: crm-assistant
description: CRM specialist that manages contacts, opportunities, lists, templates, and messaging campaigns. Use for any CRM-related task.
tools: Read, Bash, Glob, Grep
model: sonnet
memory: project
skills:
  - setup
  - create-crm
  - send-sms
  - send-whatsapp
  - import-contacts
  - manage-templates
  - manage-list
  - bulk-message
mcpServers:
  notion-crm:
---
```

With `memory: project`, the agent remembers user preferences, frequently used lists, favorite templates across sessions.

---

## What Gets Eliminated

| Component | Why Eliminated |
|-----------|---------------|
| Next.js app (all React pages/components) | Replaced by skills + MCP tools + conversational UI |
| 27 API route handlers | All logic moves to MCP server tools |
| **SQLite database** | **All data lives in Notion** |
| `better-sqlite3` dependency | No local database |
| `src/lib/db/` (client.ts, schema.sql) | Replaced by Notion API calls |
| **Accounts database** | Company is a text field on Contacts |
| OAuth authentication | Replaced by `NOTION_API_KEY` env var |
| JWE session encryption | No sessions needed |
| shadcn/ui, Radix UI, Tailwind CSS | No web UI |
| SSE streaming endpoint | Progress reported textually |
| Middleware | No route protection |
| `papaparse` on frontend | CSV parsing moves to MCP server |

---

## What Gets Significantly Improved

| Area | Before (Next.js App) | After (Plugin) |
|------|---------------------|----------------|
| **Data location** | Split between SQLite (local) and Notion (remote) — sync headaches | **All in Notion** — single source of truth |
| **Message sending** | Generate prompt → copy → paste into Claude Desktop → wait | Direct execution via iMessage/WhatsApp MCP — one-step |
| **Installation** | `git clone` → `npm install` → configure env → `npm run dev` | `claude plugin install notion-crm` → set 2 env vars → `/setup` → done |
| **CRM queries** | Navigate to tab → use search UI → read results | "Show me all open opportunities over $50k" — natural language |
| **Multi-step workflows** | Click through multi-step wizard | Describe what you want, Claude handles it |
| **Data portability** | SQLite file locked to one machine | Notion accessible everywhere, by anyone with workspace access |
| **Collaboration** | Single-user local app | Multi-user via Notion workspace sharing |
| **Updates** | `git pull` → rebuild | `claude plugin update notion-crm` |

---

## What Gets Worse (Trade-offs)

| Area | Impact | Mitigation |
|------|--------|------------|
| **API rate limits** | Notion API has rate limits (3 req/sec) | Rate limiter in MCP server (already exists). Batch operations. |
| **Offline access** | No data available without internet | Notion limitation. Acceptable for CRM use case. |
| **Speed** | Notion API calls slower than local SQLite reads | Acceptable. Cache hot data in agent memory. |
| **Contact table browsing** | No persistent sortable/filterable table view | Users can view in Notion directly. MCP returns markdown tables. |
| **Template visual editing** | No real-time WYSIWYG editor | Playground plugin + conversational fallback |
| **List management** | No drag-and-drop list builder | Playground plugin + conversational fallback + Notion UI |
| **At-a-glance dashboard** | No persistent status dashboard | `/crm-status` skill on demand |

---

## Implementation Order

### Phase 1: Plugin Scaffold + Config
1. Create plugin directory structure
2. Write `plugin.json` manifest
3. Write `.mcp.json` for single server
4. Write `hooks.json` with `SessionStart` config check
5. Write `scripts/verify-config.sh` (checks both env vars)
6. Write `/setup` skill
7. Write `/crm-status` skill

### Phase 2: Refactor MCP Server (Remove Accounts, Remove SQLite)
1. Remove `accounts.ts` tools entirely
2. Remove `get_account_overview` from `relationships.ts`
3. Simplify `contacts.ts` — remove auto-account creation, Company becomes text
4. Simplify `activities.ts` — remove account params
5. Simplify `opportunities.ts` — remove Account relation
6. Update `intelligence.ts` — remove account-based analytics
7. Update schema loader to use `NOTION_CRM_PAGE_ID` for parent
8. Port `templates/parser.ts` into MCP server

### Phase 3: New MCP Tools (Lists, Templates, Import)
1. Add `lists.ts` — CRUD + member management via Notion relations
2. Add `templates.ts` — CRUD + resolve via Notion API
3. Add `import.ts` — CSV parsing + Notion page creation
4. Add `setup_lists_database` and `setup_templates_database` tools
5. Register all new tools in `index.ts`

### Phase 4: Skills
1. Write `/create-crm` skill (create all 5 databases under parent page)
2. Write `/send-sms` and `/send-whatsapp` skills
3. Write `/import-contacts` skill
4. Write `/manage-templates` skill
5. Write `/manage-list` skill
6. Write `/bulk-message` skill

### Phase 5: Agent + Memory
1. Write `crm-assistant.md` agent definition
2. Configure persistent memory for cross-session learning

### Phase 6: Playground Integrations
1. `/manage-list` generates Playground HTML for list management
2. `/manage-templates` generates Playground HTML for template editing
3. `/import-contacts` generates Playground HTML for CSV column mapping

### Phase 7: Testing & Documentation
1. Test full installation flow
2. Test each skill end-to-end
3. Test all MCP server tools
4. Write user-facing README with setup instructions

---

## Verification Plan

1. **Plugin installs cleanly**: `claude plugin install ./notion-crm-plugin` succeeds
2. **SessionStart hook**: New session shows config status (missing vars → "Run /setup")
3. **`/setup`**: Creates all 5 databases under parent page, saves schema
4. **MCP tools**: All tools respond correctly (contacts, opportunities, lists, templates, activities, pipeline)
5. **`/create-crm`**: Creates databases with correct relations
6. **`/send-sms`**: Full flow — pick template from Notion → pick list → resolve → send → log activity
7. **`/import-contacts`**: CSV file imports to Notion Contacts DB correctly
8. **`/manage-list`**: Playground generates, user can manage list visually
9. **`/crm-status`**: Shows accurate system state (all 5 databases, counts)
10. **Playground integrations**: HTML files generate and work in browser

---

## Key Files to Reuse From Current Codebase

| File | What to Reuse | Changes Needed |
|------|---------------|----------------|
| `mcp-server/src/tools/contacts.ts` | Contact CRUD tools | Remove auto-account creation |
| `mcp-server/src/tools/opportunities.ts` | Opportunity CRUD tools | Remove Account relation |
| `mcp-server/src/tools/relationships.ts` | `link_records` tool | Remove `get_account_overview` |
| `mcp-server/src/tools/activities.ts` | Activity tools | Remove account params |
| `mcp-server/src/tools/pipeline.ts` | Pipeline analytics | Remove account analytics |
| `mcp-server/src/tools/intelligence.ts` | Scoring/analytics | Remove account analytics |
| `mcp-server/src/operations/` | All Notion API operations | Reuse as-is |
| `mcp-server/src/utils/` | Formatters, validators, date utils | Remove account formatters |
| `mcp-server/src/schema/` | Schema loader/validator | Update for new DB architecture |
| `src/lib/templates/parser.ts` | Variable engine | Port to MCP server as-is |
| `src/lib/templates/channels.ts` | Channel configs | Embed in skills |
| `src/lib/schema/default-schema.ts` | Schema definitions | Rewrite: remove Accounts, add Lists + Templates |
| `src/lib/notion/rate-limiter.ts` | Rate limiting | Reuse in MCP server |
