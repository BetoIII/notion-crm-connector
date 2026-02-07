/**
 * Message template stored in database
 */
export interface MessageTemplate {
  id: number;
  name: string;
  content: string;
  created_at: number;
  updated_at: number;
}

/**
 * Contact data resolved from Notion page
 */
export interface ContactData {
  contact_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  company?: string | null;
  [key: string]: string | number | undefined | null; // Allow additional custom fields
}

/**
 * Contact record with ID and URL from database
 */
export interface ContactRecord extends ContactData {
  id: string | number;
  url?: string | null;
  title?: string | null;
  city?: string | null;
  state?: string | null;
  source?: 'notion' | 'manual' | 'csv';
  source_id?: string | null;
  source_database_id?: string | null;
  source_url?: string | null;
  created_at?: number;
  updated_at?: number;
}

/**
 * Sent message record
 */
export interface SentMessage {
  id: number;
  template_id: number | null;
  contact_notion_url: string;
  contact_name: string | null;
  phone_number: string | null;
  resolved_message: string;
  created_at: number;
}

/**
 * Template variable found in template content
 */
export interface TemplateVariable {
  name: string;
  placeholder: string; // Full placeholder text like "{{contact_name}}"
  startIndex: number;
  endIndex: number;
}

/**
 * Request body for creating a template
 */
export interface CreateTemplateRequest {
  name: string;
  content: string;
}

/**
 * Request body for updating a template
 */
export interface UpdateTemplateRequest {
  name: string;
  content: string;
}

/**
 * Request body for logging a sent message
 */
export interface CreateSentMessageRequest {
  template_id: number | null;
  contact_notion_url: string;
  contact_name: string | null;
  phone_number: string | null;
  resolved_message: string;
}

/**
 * Response from contact resolution API
 */
export interface ContactResolutionResponse {
  success: boolean;
  contact?: ContactData;
  error?: string;
  pageId?: string;
}

/**
 * Local contact stored in SQLite
 */
export interface Contact {
  id: number;
  name: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  title: string | null;
  city: string | null;
  state: string | null;
  source: 'notion' | 'manual' | 'csv';
  source_id: string | null;
  source_database_id: string | null;
  source_url: string | null;
  created_at: number;
  updated_at: number;
}

/**
 * Connected Notion database
 */
export interface ConnectedDatabase {
  id: number;
  database_id: string;
  title: string;
  icon: string | null;
  field_mapping: string; // JSON string
  auto_sync: number;
  last_synced_at: number | null;
  created_at: number;
}

/**
 * Field mapping for Notion database import
 */
export interface FieldMapping {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  city?: string;
  state?: string;
}

/**
 * Request body for creating a contact
 */
export interface CreateContactRequest {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  city?: string;
  state?: string;
}

/**
 * Request body for updating a contact
 */
export interface UpdateContactRequest {
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  title?: string;
  city?: string;
  state?: string;
}

/**
 * Request body for bulk deleting contacts
 */
export interface BulkDeleteContactsRequest {
  ids: number[];
}

/**
 * Request body for connecting a Notion database
 */
export interface ConnectNotionDatabaseRequest {
  database_id: string;
  title: string;
  icon?: string;
  field_mapping: FieldMapping;
  auto_sync?: boolean;
}

/**
 * Paginated contacts response
 */
export interface PaginatedContactsResponse {
  contacts: Contact[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
