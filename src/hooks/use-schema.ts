"use client";

import { createContext, useContext, useReducer, ReactNode, Dispatch, createElement } from "react";
import {
  CRMSchema,
  PropertyDefinition,
  DatabaseDefinition,
} from "@/lib/schema/types";
import { getDefaultSchema } from "@/lib/schema/default-schema";

// Action types
type SchemaAction =
  | { type: "RENAME_DATABASE"; databaseId: string; name: string }
  | {
      type: "ADD_PROPERTY";
      databaseId: string;
      property: PropertyDefinition;
    }
  | {
      type: "UPDATE_PROPERTY";
      databaseId: string;
      propertyId: string;
      updates: Partial<PropertyDefinition>;
    }
  | { type: "DELETE_PROPERTY"; databaseId: string; propertyId: string }
  | {
      type: "REORDER_PROPERTY";
      databaseId: string;
      propertyId: string;
      newIndex: number;
    }
  | { type: "RESET_SCHEMA" }
  | { type: "SET_SCHEMA"; schema: CRMSchema };

// Schema reducer
function schemaReducer(state: CRMSchema, action: SchemaAction): CRMSchema {
  switch (action.type) {
    case "RENAME_DATABASE": {
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id === action.databaseId ? { ...db, name: action.name } : db
        ),
      };
    }

    case "ADD_PROPERTY": {
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id === action.databaseId
            ? { ...db, properties: [...db.properties, action.property] }
            : db
        ),
      };
    }

    case "UPDATE_PROPERTY": {
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id === action.databaseId
            ? {
                ...db,
                properties: db.properties.map((prop) =>
                  prop.id === action.propertyId
                    ? { ...prop, ...action.updates }
                    : prop
                ),
              }
            : db
        ),
      };
    }

    case "DELETE_PROPERTY": {
      return {
        ...state,
        databases: state.databases.map((db) =>
          db.id === action.databaseId
            ? {
                ...db,
                properties: db.properties.filter(
                  (prop) => prop.id !== action.propertyId
                ),
              }
            : db
        ),
      };
    }

    case "REORDER_PROPERTY": {
      return {
        ...state,
        databases: state.databases.map((db) => {
          if (db.id !== action.databaseId) return db;

          const properties = [...db.properties];
          const currentIndex = properties.findIndex(
            (p) => p.id === action.propertyId
          );
          if (currentIndex === -1) return db;

          const [removed] = properties.splice(currentIndex, 1);
          properties.splice(action.newIndex, 0, removed);

          return { ...db, properties };
        }),
      };
    }

    case "RESET_SCHEMA": {
      return getDefaultSchema();
    }

    case "SET_SCHEMA": {
      return action.schema;
    }

    default:
      return state;
  }
}

// Context
interface SchemaContextValue {
  schema: CRMSchema;
  dispatch: Dispatch<SchemaAction>;
}

const SchemaContext = createContext<SchemaContextValue | null>(null);

// Provider
export function SchemaProvider({ children }: { children: ReactNode }) {
  const [schema, dispatch] = useReducer(schemaReducer, getDefaultSchema());

  const value = { schema, dispatch };

  return createElement(SchemaContext.Provider, { value }, children);
}

// Hook
export function useSchema() {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error("useSchema must be used within SchemaProvider");
  }
  return context;
}

// Helper functions for common operations
export function useSchemaMutations() {
  const { dispatch } = useSchema();

  return {
    renameDatabase: (databaseId: string, name: string) =>
      dispatch({ type: "RENAME_DATABASE", databaseId, name }),

    addProperty: (databaseId: string, property: PropertyDefinition) =>
      dispatch({ type: "ADD_PROPERTY", databaseId, property }),

    updateProperty: (
      databaseId: string,
      propertyId: string,
      updates: Partial<PropertyDefinition>
    ) => dispatch({ type: "UPDATE_PROPERTY", databaseId, propertyId, updates }),

    deleteProperty: (databaseId: string, propertyId: string) =>
      dispatch({ type: "DELETE_PROPERTY", databaseId, propertyId }),

    reorderProperty: (
      databaseId: string,
      propertyId: string,
      newIndex: number
    ) => dispatch({ type: "REORDER_PROPERTY", databaseId, propertyId, newIndex }),

    resetSchema: () => dispatch({ type: "RESET_SCHEMA" }),

    setSchema: (schema: CRMSchema) => dispatch({ type: "SET_SCHEMA", schema }),
  };
}
