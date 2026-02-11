import { DatabaseKey } from "../schema/types.js";
import { getDatabaseDef } from "../schema/loader.js";
import { resolveSelectAlias } from "./aliases.js";

type NotionPropertyValue = Record<string, unknown>;

export function buildProperties(
  dbKey: DatabaseKey,
  data: Record<string, unknown>
): Record<string, NotionPropertyValue> {
  const dbDef = getDatabaseDef(dbKey);
  if (!dbDef) throw new Error(`No database definition for: ${dbKey}`);

  const properties: Record<string, NotionPropertyValue> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;

    const propDef = dbDef.properties[key];
    if (!propDef) {
      console.error(`[property-builder] Unknown property "${key}" for ${dbKey}, skipping`);
      continue;
    }

    // Skip relation properties - handled separately via link operations
    if (propDef.type === "relation") continue;
    // Skip people properties - require user IDs
    if (propDef.type === "people") continue;

    const built = buildSingleProperty(propDef.type, key, value);
    if (built) {
      properties[key] = built;
    }
  }

  return properties;
}

function buildSingleProperty(
  type: string,
  propertyName: string,
  value: unknown
): NotionPropertyValue | null {
  const strValue = String(value);

  switch (type) {
    case "title":
      return {
        title: [{ text: { content: strValue } }],
      };

    case "rich_text":
      return {
        rich_text: [{ text: { content: strValue } }],
      };

    case "email":
      return { email: strValue };

    case "phone_number":
      return { phone_number: strValue };

    case "url":
      return { url: strValue };

    case "number":
      return { number: Number(value) };

    case "select": {
      const resolved = resolveSelectAlias(propertyName, strValue);
      return {
        select: { name: resolved },
      };
    }

    case "multi_select": {
      const items = Array.isArray(value) ? value : strValue.split(",").map((s) => s.trim());
      return {
        multi_select: items.map((item: string) => ({ name: item.trim() })),
      };
    }

    case "date": {
      return {
        date: { start: strValue },
      };
    }

    case "checkbox":
      return { checkbox: Boolean(value) };

    default:
      console.error(`[property-builder] Unsupported type "${type}" for "${propertyName}"`);
      return null;
  }
}

export function buildRelationProperty(targetIds: string[]): NotionPropertyValue {
  return {
    relation: targetIds.map((id) => ({ id })),
  };
}
