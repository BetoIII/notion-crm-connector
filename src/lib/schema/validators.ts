/**
 * Schema validation utilities
 */

import { CRMSchema, DatabaseDefinition, PropertyDefinition } from "./types";

export interface ValidationError {
  type: "error" | "warning";
  message: string;
  databaseId?: string;
  propertyId?: string;
}

/**
 * Validate the entire CRM schema
 */
export function validateSchema(schema: CRMSchema): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check minimum databases
  if (schema.databases.length === 0) {
    errors.push({
      type: "error",
      message: "Schema must have at least one database",
    });
    return errors;
  }

  // Validate each database
  for (const database of schema.databases) {
    errors.push(...validateDatabase(database, schema));
  }

  // Validate relations point to valid databases
  errors.push(...validateRelations(schema));

  return errors;
}

/**
 * Validate a single database
 */
export function validateDatabase(
  database: DatabaseDefinition,
  schema: CRMSchema
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check database name
  if (!database.name || database.name.trim() === "") {
    errors.push({
      type: "error",
      message: "Database name cannot be empty",
      databaseId: database.id,
    });
  }

  // Check for properties
  if (database.properties.length === 0) {
    errors.push({
      type: "error",
      message: "Database must have at least one property",
      databaseId: database.id,
    });
    return errors;
  }

  // Check for exactly one title property
  const titleProperties = database.properties.filter((p) => p.type === "title");
  if (titleProperties.length === 0) {
    errors.push({
      type: "error",
      message: "Database must have exactly one title property",
      databaseId: database.id,
    });
  } else if (titleProperties.length > 1) {
    errors.push({
      type: "error",
      message: "Database can only have one title property",
      databaseId: database.id,
    });
  }

  // Validate each property
  for (const property of database.properties) {
    errors.push(...validateProperty(property, database));
  }

  // Check for duplicate property names
  const propertyNames = database.properties.map((p) => p.name.toLowerCase());
  const duplicates = propertyNames.filter(
    (name, index) => propertyNames.indexOf(name) !== index
  );
  if (duplicates.length > 0) {
    errors.push({
      type: "error",
      message: `Duplicate property names found: ${duplicates.join(", ")}`,
      databaseId: database.id,
    });
  }

  return errors;
}

/**
 * Validate a single property
 */
export function validateProperty(
  property: PropertyDefinition,
  database: DatabaseDefinition
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check property name
  if (!property.name || property.name.trim() === "") {
    errors.push({
      type: "error",
      message: "Property name cannot be empty",
      databaseId: database.id,
      propertyId: property.id,
    });
  }

  // Validate select/multi_select options
  if (property.type === "select" || property.type === "multi_select") {
    if (!property.options || property.options.length === 0) {
      errors.push({
        type: "warning",
        message: `${property.type} property "${property.name}" has no options`,
        databaseId: database.id,
        propertyId: property.id,
      });
    } else {
      // Check for empty option names
      const emptyOptions = property.options.filter(
        (opt) => !opt.name || opt.name.trim() === ""
      );
      if (emptyOptions.length > 0) {
        errors.push({
          type: "error",
          message: `${property.type} property "${property.name}" has empty option names`,
          databaseId: database.id,
          propertyId: property.id,
        });
      }
    }
  }

  // Validate relation
  if (property.type === "relation") {
    if (!property.relation) {
      errors.push({
        type: "error",
        message: `Relation property "${property.name}" is missing relation config`,
        databaseId: database.id,
        propertyId: property.id,
      });
    } else {
      if (!property.relation.targetDatabaseKey) {
        errors.push({
          type: "error",
          message: `Relation property "${property.name}" is missing target database`,
          databaseId: database.id,
          propertyId: property.id,
        });
      }
      if (!property.relation.syncedPropertyName) {
        errors.push({
          type: "error",
          message: `Relation property "${property.name}" is missing synced property name`,
          databaseId: database.id,
          propertyId: property.id,
        });
      }
    }
  }

  return errors;
}

/**
 * Validate that all relations point to valid databases
 */
export function validateRelations(schema: CRMSchema): ValidationError[] {
  const errors: ValidationError[] = [];
  const databaseKeys = schema.databases.map((db) => db.key);

  for (const database of schema.databases) {
    for (const property of database.properties) {
      if (property.type === "relation" && property.relation) {
        if (!databaseKeys.includes(property.relation.targetDatabaseKey)) {
          errors.push({
            type: "error",
            message: `Relation "${property.name}" in "${database.name}" points to non-existent database "${property.relation.targetDatabaseKey}"`,
            databaseId: database.id,
            propertyId: property.id,
          });
        }
      }
    }
  }

  return errors;
}

/**
 * Check if property name is unique within database
 */
export function isPropertyNameUnique(
  name: string,
  databaseId: string,
  excludePropertyId: string | null,
  schema: CRMSchema
): boolean {
  const database = schema.databases.find((db) => db.id === databaseId);
  if (!database) return true;

  const normalizedName = name.toLowerCase().trim();
  return !database.properties.some(
    (p) =>
      p.id !== excludePropertyId &&
      p.name.toLowerCase().trim() === normalizedName
  );
}

/**
 * Estimate schema size (rough approximation for 50KB limit)
 */
export function estimateSchemaSize(schema: CRMSchema): number {
  const jsonString = JSON.stringify(schema);
  return new Blob([jsonString]).size;
}
