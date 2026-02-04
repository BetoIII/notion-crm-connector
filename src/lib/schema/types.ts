/**
 * Type definitions for CRM schema
 */

export type PropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "select"
  | "multi_select"
  | "date"
  | "people"
  | "url"
  | "email"
  | "phone_number"
  | "relation";

export interface SelectOption {
  name: string;
  color?: string;
}

export interface RelationConfig {
  targetDatabaseKey: string; // "accounts" | "contacts" | "opportunities"
  syncedPropertyName: string; // Name of the reverse property on target DB
}

export interface PropertyDefinition {
  id: string; // Internal UUID for React keys
  name: string;
  type: PropertyType;
  options?: SelectOption[]; // For select / multi_select
  relation?: RelationConfig; // For relation type
}

export interface DatabaseDefinition {
  id: string; // Internal UUID
  key: string; // "accounts" | "contacts" | "opportunities"
  name: string; // Display name
  icon?: string; // Emoji
  description?: string;
  properties: PropertyDefinition[];
}

export interface CRMSchema {
  databases: DatabaseDefinition[];
}

// Notion API types (for database creation)
export interface NotionDatabaseResponse {
  id: string;
  object: "database";
  data_sources?: Array<{
    id: string;
    type: string;
  }>;
}
