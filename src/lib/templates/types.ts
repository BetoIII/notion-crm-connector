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
  contact_name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email?: string;
  company?: string;
  [key: string]: string | undefined; // Allow additional custom fields
}

/**
 * Contact record with ID and URL from database
 */
export interface ContactRecord extends ContactData {
  id: string;
  url: string;
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
