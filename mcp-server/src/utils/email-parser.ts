export interface ParsedContact {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  company?: string;
  linkedin?: string;
}

const SIGNATURE_PATTERNS = [
  /(?<name>[A-Z][a-z]+ [A-Z][a-z]+)\s*\n(?<title>[^\n]+)\s*\n(?<company>[^\n]+)\s*\n(?<phone>[0-9\-()+\s]+)$/m,
  /(?<name>[A-Z][a-z]+ [A-Z][a-z]+)\s*\|\s*(?<title>[^|]+)\s*\|\s*(?<company>[^|]+)\s*\|\s*(?<phone>[0-9\-()+\s]+)$/m,
  /(?<name>[A-Z][a-z]+ [A-Z][a-z]+)\s*,\s*(?<title>[^,]+)\s*\n(?<company>[^\n]+)\s*\nP:\s*(?<phone>[0-9\-()+\s]+)/m,
  /Best regards?,\s*\n(?<name>[A-Z][a-z]+ [A-Z][a-z]+)\s*\n(?<title>[^\n]+)\s*\n(?<company>[^\n]+)/m,
];

const EMAIL_REGEX = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
const PHONE_REGEX = /(?:\+1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/;
const LINKEDIN_REGEX = /(https?:\/\/(?:www\.)?linkedin\.com\/in\/[^\s]+)/i;

const PERSONAL_DOMAINS = new Set([
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com",
  "aol.com", "protonmail.com", "mail.com",
]);

export function parseEmailSignature(text: string): ParsedContact {
  const result: ParsedContact = {};

  // Try structured signature patterns
  for (const pattern of SIGNATURE_PATTERNS) {
    const match = text.match(pattern);
    if (match?.groups) {
      result.name = match.groups.name?.trim();
      result.title = match.groups.title?.trim();
      result.company = match.groups.company?.trim();
      if (match.groups.phone) {
        result.phone = match.groups.phone.trim();
      }
      break;
    }
  }

  // Extract email
  const emailMatch = text.match(EMAIL_REGEX);
  if (emailMatch) {
    result.email = emailMatch[1];

    // Infer company from domain if not already found
    if (!result.company && result.email) {
      const domain = result.email.split("@")[1];
      if (!PERSONAL_DOMAINS.has(domain)) {
        result.company = domain
          .replace(/^www\./, "")
          .replace(/\.(com|net|org|io|co)$/, "")
          .split(".")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
    }
  }

  // Extract phone if not already found
  if (!result.phone) {
    const phoneMatch = text.match(PHONE_REGEX);
    if (phoneMatch) {
      result.phone = `(${phoneMatch[1]}) ${phoneMatch[2]}-${phoneMatch[3]}`;
    }
  }

  // Extract LinkedIn
  const linkedinMatch = text.match(LINKEDIN_REGEX);
  if (linkedinMatch) {
    result.linkedin = linkedinMatch[1];
  }

  return result;
}
