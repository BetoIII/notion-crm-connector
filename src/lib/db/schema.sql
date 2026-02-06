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
