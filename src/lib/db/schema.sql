-- Message Templates Table
CREATE TABLE IF NOT EXISTS message_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Sent Messages Table
CREATE TABLE IF NOT EXISTS sent_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_id INTEGER,
  contact_notion_url TEXT NOT NULL,
  contact_name TEXT,
  phone_number TEXT,
  resolved_message TEXT NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
  FOREIGN KEY (template_id) REFERENCES message_templates(id) ON DELETE SET NULL
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_sent_messages_contact_url ON sent_messages(contact_notion_url);
CREATE INDEX IF NOT EXISTS idx_sent_messages_created_at ON sent_messages(created_at);

-- Local Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  city TEXT,
  state TEXT,
  source TEXT NOT NULL DEFAULT 'manual',   -- 'notion', 'manual', 'csv'
  source_id TEXT,                           -- Notion page ID or external ID
  source_database_id TEXT,                  -- Notion database ID
  source_url TEXT,                          -- Notion page URL
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
  updated_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_source
  ON contacts(source, source_id);

-- Connected Notion Databases Table
CREATE TABLE IF NOT EXISTS notion_connected_databases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  database_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  icon TEXT,
  field_mapping TEXT,         -- JSON: maps Notion property names -> contact fields
  auto_sync INTEGER DEFAULT 0,
  last_synced_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (strftime('%s','now'))
);
