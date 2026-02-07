import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "messages.db");
const SCHEMA_PATH = path.join(process.cwd(), "src", "lib", "db", "schema.sql");

let db: Database.Database | null = null;

/**
 * Initialize the SQLite database connection
 */
export function getDatabase(): Database.Database {
  if (db) {
    return db;
  }

  // Ensure data directory exists
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // Create database connection
  db = new Database(DB_PATH);
  
  // Enable foreign keys
  db.pragma("foreign_keys = ON");

  // Initialize schema
  const schema = fs.readFileSync(SCHEMA_PATH, "utf-8");
  db.exec(schema);

  return db;
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Message template operations
 */
export const templateDB = {
  /**
   * Get all templates
   */
  getAll() {
    const db = getDatabase();
    return db.prepare("SELECT * FROM message_templates ORDER BY updated_at DESC").all();
  },

  /**
   * Get template by ID
   */
  getById(id: number) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM message_templates WHERE id = ?").get(id);
  },

  /**
   * Create a new template
   */
  create(name: string, content: string) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(
      "INSERT INTO message_templates (name, content, created_at, updated_at) VALUES (?, ?, ?, ?)"
    ).run(name, content, now, now);
    return result.lastInsertRowid;
  },

  /**
   * Update a template
   */
  update(id: number, name: string, content: string) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(
      "UPDATE message_templates SET name = ?, content = ?, updated_at = ? WHERE id = ?"
    ).run(name, content, now, id);
    return result.changes > 0;
  },

  /**
   * Delete a template
   */
  delete(id: number) {
    const db = getDatabase();
    const result = db.prepare("DELETE FROM message_templates WHERE id = ?").run(id);
    return result.changes > 0;
  },
};

/**
 * Sent message operations
 */
export const messageDB = {
  /**
   * Get all sent messages
   */
  getAll() {
    const db = getDatabase();
    return db.prepare("SELECT * FROM sent_messages ORDER BY created_at DESC").all();
  },

  /**
   * Get sent messages by contact URL
   */
  getByContact(contactNotionUrl: string) {
    const db = getDatabase();
    return db.prepare(
      "SELECT * FROM sent_messages WHERE contact_notion_url = ? ORDER BY created_at DESC"
    ).all(contactNotionUrl);
  },

  /**
   * Create a sent message record
   */
  create(
    templateId: number | null,
    contactNotionUrl: string,
    contactName: string | null,
    phoneNumber: string | null,
    resolvedMessage: string
  ) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(
      `INSERT INTO sent_messages
       (template_id, contact_notion_url, contact_name, phone_number, resolved_message, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(templateId, contactNotionUrl, contactName, phoneNumber, resolvedMessage, now);
    return result.lastInsertRowid;
  },
};

/**
 * Contact operations
 */
export const contactDB = {
  /**
   * Get all contacts with optional filtering
   */
  getAll(options?: { search?: string; source?: string; limit?: number; offset?: number }) {
    const db = getDatabase();
    let query = "SELECT * FROM contacts WHERE 1=1";
    const params: any[] = [];

    if (options?.search) {
      query += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (options?.source) {
      query += " AND source = ?";
      params.push(options.source);
    }

    query += " ORDER BY updated_at DESC";

    if (options?.limit) {
      query += " LIMIT ?";
      params.push(options.limit);
    }

    if (options?.offset) {
      query += " OFFSET ?";
      params.push(options.offset);
    }

    return db.prepare(query).all(...params);
  },

  /**
   * Search contacts
   */
  search(searchTerm: string) {
    const db = getDatabase();
    const term = `%${searchTerm}%`;
    return db.prepare(
      `SELECT * FROM contacts
       WHERE name LIKE ? OR email LIKE ? OR company LIKE ?
       ORDER BY updated_at DESC`
    ).all(term, term, term);
  },

  /**
   * Get contact by ID
   */
  getById(id: number) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM contacts WHERE id = ?").get(id);
  },

  /**
   * Get total count of contacts
   */
  getCount(options?: { search?: string; source?: string; source_database_id?: string }) {
    const db = getDatabase();
    let query = "SELECT COUNT(*) as count FROM contacts WHERE 1=1";
    const params: any[] = [];

    if (options?.search) {
      query += " AND (name LIKE ? OR email LIKE ? OR company LIKE ?)";
      const searchTerm = `%${options.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (options?.source) {
      query += " AND source = ?";
      params.push(options.source);
    }

    if (options?.source_database_id) {
      query += " AND source_database_id = ?";
      params.push(options.source_database_id);
    }

    const result = db.prepare(query).get(...params) as { count: number };
    return result.count;
  },

  /**
   * Create a new contact
   */
  create(contact: {
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
    city?: string;
    state?: string;
    source?: string;
    source_id?: string;
    source_database_id?: string;
    source_url?: string;
  }) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(
      `INSERT INTO contacts
       (name, first_name, last_name, email, phone, company, title, city, state,
        source, source_id, source_database_id, source_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      contact.name || null,
      contact.first_name || null,
      contact.last_name || null,
      contact.email || null,
      contact.phone || null,
      contact.company || null,
      contact.title || null,
      contact.city || null,
      contact.state || null,
      contact.source || 'manual',
      contact.source_id || null,
      contact.source_database_id || null,
      contact.source_url || null,
      now,
      now
    );
    return result.lastInsertRowid;
  },

  /**
   * Batch insert contacts (for import/sync)
   */
  createMany(contacts: Array<{
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
    city?: string;
    state?: string;
    source?: string;
    source_id?: string;
    source_database_id?: string;
    source_url?: string;
  }>) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);

    const insert = db.prepare(
      `INSERT OR REPLACE INTO contacts
       (name, first_name, last_name, email, phone, company, title, city, state,
        source, source_id, source_database_id, source_url, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertMany = db.transaction((contacts) => {
      for (const contact of contacts) {
        insert.run(
          contact.name || null,
          contact.first_name || null,
          contact.last_name || null,
          contact.email || null,
          contact.phone || null,
          contact.company || null,
          contact.title || null,
          contact.city || null,
          contact.state || null,
          contact.source || 'notion',
          contact.source_id || null,
          contact.source_database_id || null,
          contact.source_url || null,
          now,
          now
        );
      }
    });

    insertMany(contacts);
  },

  /**
   * Update a contact
   */
  update(id: number, contact: {
    name?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    company?: string;
    title?: string;
    city?: string;
    state?: string;
  }) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(
      `UPDATE contacts
       SET name = ?, first_name = ?, last_name = ?, email = ?, phone = ?,
           company = ?, title = ?, city = ?, state = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      contact.name || null,
      contact.first_name || null,
      contact.last_name || null,
      contact.email || null,
      contact.phone || null,
      contact.company || null,
      contact.title || null,
      contact.city || null,
      contact.state || null,
      now,
      id
    );
    return result.changes > 0;
  },

  /**
   * Delete a contact
   */
  delete(id: number) {
    const db = getDatabase();
    const result = db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
    return result.changes > 0;
  },

  /**
   * Delete contacts by source
   */
  deleteBySource(source: string, sourceId?: string) {
    const db = getDatabase();
    let query = "DELETE FROM contacts WHERE source = ?";
    const params: any[] = [source];

    if (sourceId) {
      query += " AND source_database_id = ?";
      params.push(sourceId);
    }

    const result = db.prepare(query).run(...params);
    return result.changes;
  },
};

/**
 * Connected Notion databases operations
 */
export const connectedDBsDB = {
  /**
   * Get all connected databases
   */
  getAll() {
    const db = getDatabase();
    return db.prepare("SELECT * FROM notion_connected_databases ORDER BY created_at DESC").all();
  },

  /**
   * Get connected database by ID
   */
  getById(id: number) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM notion_connected_databases WHERE id = ?").get(id);
  },

  /**
   * Get connected database by Notion database ID
   */
  getByDatabaseId(databaseId: string) {
    const db = getDatabase();
    return db.prepare("SELECT * FROM notion_connected_databases WHERE database_id = ?").get(databaseId);
  },

  /**
   * Connect a new Notion database
   */
  connect(database: {
    database_id: string;
    title: string;
    icon?: string;
    field_mapping: string;
    auto_sync?: number;
  }) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(
      `INSERT INTO notion_connected_databases
       (database_id, title, icon, field_mapping, auto_sync, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      database.database_id,
      database.title,
      database.icon || null,
      database.field_mapping,
      database.auto_sync || 0,
      now
    );
    return result.lastInsertRowid;
  },

  /**
   * Update last synced timestamp
   */
  updateLastSynced(id: number) {
    const db = getDatabase();
    const now = Math.floor(Date.now() / 1000);
    const result = db.prepare(
      "UPDATE notion_connected_databases SET last_synced_at = ? WHERE id = ?"
    ).run(now, id);
    return result.changes > 0;
  },

  /**
   * Disconnect (delete) a database connection
   */
  disconnect(id: number) {
    const db = getDatabase();
    const result = db.prepare("DELETE FROM notion_connected_databases WHERE id = ?").run(id);
    return result.changes > 0;
  },
};
