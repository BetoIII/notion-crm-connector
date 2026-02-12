const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEX32_REGEX = /^[0-9a-f]{32}$/i;
const NOTION_URL_ID_REGEX = /([0-9a-f]{32})(?:\?|$)/i;
const NOTION_URL_DASHED_REGEX = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i;

export function sanitizeNotionUUID(input: string): string {
  let cleaned = input.trim();

  // Already valid UUID
  if (UUID_REGEX.test(cleaned)) {
    return cleaned.toLowerCase();
  }

  // Extract from Notion URL (dashed form)
  const dashedMatch = cleaned.match(NOTION_URL_DASHED_REGEX);
  if (dashedMatch) {
    return dashedMatch[1].toLowerCase();
  }

  // Extract from Notion URL (32-char hex)
  const urlMatch = cleaned.match(NOTION_URL_ID_REGEX);
  if (urlMatch) {
    cleaned = urlMatch[1];
  }

  // Remove existing dashes
  cleaned = cleaned.replace(/-/g, "");

  // Validate 32 hex chars
  if (!HEX32_REGEX.test(cleaned)) {
    throw new Error(`Invalid Notion UUID: "${input}"`);
  }

  // Format as 8-4-4-4-12
  return `${cleaned.slice(0, 8)}-${cleaned.slice(8, 12)}-${cleaned.slice(12, 16)}-${cleaned.slice(16, 20)}-${cleaned.slice(20)}`.toLowerCase();
}
