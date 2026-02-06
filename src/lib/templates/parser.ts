import type { ContactData, TemplateVariable } from "./types";

/**
 * Extract all template variables from a template string
 * Variables are in the format {{variable_name}}
 */
export function extractVariables(template: string): TemplateVariable[] {
  const variables: TemplateVariable[] = [];
  const regex = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push({
      name: match[1],
      placeholder: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return variables;
}

/**
 * Replace template variables with contact data
 * Missing values are replaced with empty string
 * Automatically splits contact_name into first_name and last_name if needed
 */
export function replaceVariables(
  template: string,
  contactData: ContactData
): string {
  // Enhance contact data with first_name and last_name if not present
  const enhancedData = enhanceContactData(contactData);

  const variables = extractVariables(template);
  let result = template;

  // Replace in reverse order to maintain correct indices
  for (let i = variables.length - 1; i >= 0; i--) {
    const variable = variables[i];
    const value = enhancedData[variable.name] || "";
    result =
      result.substring(0, variable.startIndex) +
      value +
      result.substring(variable.endIndex);
  }

  return result;
}

/**
 * Get list of unique variable names from a template
 */
export function getVariableNames(template: string): string[] {
  const variables = extractVariables(template);
  const uniqueNames = new Set(variables.map((v) => v.name));
  return Array.from(uniqueNames);
}

/**
 * Validate that all required variables have values in contact data
 * Returns array of missing variable names
 * Automatically considers first_name and last_name from contact_name splitting
 */
export function validateVariables(
  template: string,
  contactData: ContactData
): string[] {
  // Enhance contact data with first_name and last_name if not present
  const enhancedData = enhanceContactData(contactData);

  const variableNames = getVariableNames(template);
  const missing: string[] = [];

  for (const name of variableNames) {
    if (!enhancedData[name] || enhancedData[name].trim() === "") {
      missing.push(name);
    }
  }

  return missing;
}

/**
 * Split a full name into first and last name
 * Handles common name formats intelligently
 */
export function splitFullName(fullName: string): { first_name: string; last_name: string } {
  const trimmed = fullName.trim();

  if (!trimmed) {
    return { first_name: "", last_name: "" };
  }

  // Split by whitespace
  const parts = trimmed.split(/\s+/);

  if (parts.length === 1) {
    // Single name - treat as first name
    return { first_name: parts[0], last_name: "" };
  } else if (parts.length === 2) {
    // Two parts - first and last
    return { first_name: parts[0], last_name: parts[1] };
  } else {
    // Three or more parts - first name is first part, last name is last part
    // Middle names are considered part of first name
    return {
      first_name: parts.slice(0, -1).join(" "),
      last_name: parts[parts.length - 1]
    };
  }
}

/**
 * Enhance contact data with first_name and last_name if not already present
 * Automatically splits contact_name if needed
 */
export function enhanceContactData(contactData: ContactData): ContactData {
  const enhanced = { ...contactData };

  // If first_name and last_name are already present, no need to split
  if (enhanced.first_name && enhanced.last_name) {
    return enhanced;
  }

  // If we have contact_name but missing first_name or last_name, split it
  if (enhanced.contact_name && (!enhanced.first_name || !enhanced.last_name)) {
    const { first_name, last_name } = splitFullName(enhanced.contact_name);

    // Only set if not already present
    if (!enhanced.first_name) {
      enhanced.first_name = first_name;
    }
    if (!enhanced.last_name) {
      enhanced.last_name = last_name;
    }
  }

  return enhanced;
}

/**
 * Common template variables for quick insertion
 */
export const COMMON_VARIABLES = [
  { name: "contact_name", label: "Contact Name", placeholder: "{{contact_name}}" },
  { name: "first_name", label: "First Name", placeholder: "{{first_name}}" },
  { name: "last_name", label: "Last Name", placeholder: "{{last_name}}" },
  { name: "phone", label: "Phone", placeholder: "{{phone}}" },
  { name: "email", label: "Email", placeholder: "{{email}}" },
  { name: "company", label: "Company", placeholder: "{{company}}" },
] as const;
