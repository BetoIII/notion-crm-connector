/**
 * Convert internal schema format to Notion API format
 */

import { PropertyDefinition, DatabaseDefinition } from "@/lib/schema/types";

/**
 * Convert a property to Notion API property format
 * Note: Relation properties are NOT included here - they're added separately via PATCH
 */
export function propertyToNotionFormat(property: PropertyDefinition): any {
  const base: any = {
    name: property.name,
  };

  switch (property.type) {
    case "title":
      return { ...base, title: {} };

    case "rich_text":
      return { ...base, rich_text: {} };

    case "number":
      return { ...base, number: { format: "number" } };

    case "select":
      return {
        ...base,
        select: {
          options: (property.options || []).map((opt) => ({
            name: opt.name,
            color: opt.color || "default",
          })),
        },
      };

    case "multi_select":
      return {
        ...base,
        multi_select: {
          options: (property.options || []).map((opt) => ({
            name: opt.name,
            color: opt.color || "default",
          })),
        },
      };

    case "date":
      return { ...base, date: {} };

    case "people":
      return { ...base, people: {} };

    case "url":
      return { ...base, url: {} };

    case "email":
      return { ...base, email: {} };

    case "phone_number":
      return { ...base, phone_number: {} };

    // Relations are NOT included in initial database creation
    case "relation":
      return null;

    default:
      return null;
  }
}

/**
 * Convert database properties to Notion API format (excluding relations)
 */
export function databasePropertiesToNotionFormat(
  database: DatabaseDefinition
): Record<string, any> {
  const properties: Record<string, any> = {};

  for (const property of database.properties) {
    // Skip relation properties - they're added via PATCH after all DBs exist
    if (property.type === "relation") continue;

    const notionProperty = propertyToNotionFormat(property);
    if (notionProperty) {
      properties[property.name] = notionProperty;
    }
  }

  return properties;
}

/**
 * Create relation property in Notion API format for PATCH request
 */
export function createRelationProperty(
  property: PropertyDefinition,
  targetDataSourceId: string
): any {
  if (property.type !== "relation" || !property.relation) {
    throw new Error("Invalid relation property");
  }

  return {
    [property.name]: {
      type: "relation",
      relation: {
        database_id: targetDataSourceId,
        type: "dual_property",
        dual_property: {
          synced_property_name: property.relation.syncedPropertyName,
        },
      },
    },
  };
}
