import { loadSchema } from "../schema/loader.js";

export function resolvePropertyAlias(input: string): string {
  const schema = loadSchema();
  return schema.property_aliases[input] || input;
}

export function resolveSelectAlias(propertyName: string, value: string): string {
  const schema = loadSchema();
  const aliases = schema.select_option_aliases[propertyName];
  if (aliases) {
    return aliases[value] || value;
  }
  return value;
}

export function resolveSelectAliases(data: Record<string, unknown>): Record<string, unknown> {
  const schema = loadSchema();
  const resolved = { ...data };

  for (const [key, value] of Object.entries(resolved)) {
    if (typeof value === "string" && schema.select_option_aliases[key]) {
      resolved[key] = resolveSelectAlias(key, value);
    }
  }

  return resolved;
}
