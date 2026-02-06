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
