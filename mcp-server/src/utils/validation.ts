const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_REGEX = /^[+]?[\d\s().-]{7,20}$/;
const URL_REGEX = /^https?:\/\/.+/i;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone.trim());
}

export function isValidUrl(url: string): boolean {
  return URL_REGEX.test(url.trim());
}

export function isValidDate(date: string): boolean {
  return !isNaN(Date.parse(date));
}

export function isValidNumber(value: unknown): boolean {
  return typeof value === "number" && !isNaN(value);
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateContact(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data["Contact Name"] && !data["name"]) {
    errors.push({ field: "Contact Name", message: "Contact name is required" });
  }

  const email = (data["Contact Email"] || data["email"]) as string | undefined;
  if (email && !isValidEmail(email)) {
    errors.push({ field: "Contact Email", message: `Invalid email: ${email}` });
  }

  const phone = (data["Contact Phone"] || data["phone"]) as string | undefined;
  if (phone && !isValidPhone(phone)) {
    errors.push({ field: "Contact Phone", message: `Invalid phone: ${phone}` });
  }

  const linkedin = (data["LinkedIn"] || data["linkedin"]) as string | undefined;
  if (linkedin && !isValidUrl(linkedin)) {
    errors.push({ field: "LinkedIn", message: `Invalid URL: ${linkedin}` });
  }

  return errors;
}

export function validateOpportunity(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data["Name"] && !data["name"]) {
    errors.push({ field: "Name", message: "Opportunity name is required" });
  }

  const dealValue = data["Deal Value"] || data["deal_value"];
  if (dealValue !== undefined && !isValidNumber(Number(dealValue))) {
    errors.push({ field: "Deal Value", message: `Invalid deal value: ${dealValue}` });
  }

  return errors;
}

export function validateAccount(data: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!data["Company  Name"] && !data["company_name"] && !data["name"]) {
    errors.push({ field: "Company  Name", message: "Company name is required" });
  }

  return errors;
}
