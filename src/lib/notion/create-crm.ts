/**
 * CRM creation orchestrator
 * 3-phase pipeline: Create parent page → Create databases → Add relations
 * Yields progress events for SSE streaming
 */

import { CRMSchema, DatabaseDefinition } from "@/lib/schema/types";
import { NotionClient } from "./client";
import { RateLimiter } from "./rate-limiter";
import {
  databasePropertiesToNotionFormat,
  createRelationProperty,
} from "./schema-to-notion";

export interface ProgressEvent {
  step: number;
  totalSteps: number;
  phase: "creating_parent" | "creating_databases" | "adding_relations" | "complete" | "error";
  message: string;
  detail?: string;
  databaseName?: string;
  status: "pending" | "in_progress" | "success" | "error";
  error?: string;
}

interface DatabaseInfo {
  key: string;
  name: string;
  databaseId: string;
  dataSourceId: string;
}

/**
 * Create CRM databases in Notion workspace
 */
export async function* createCRM(
  schema: CRMSchema,
  accessToken: string,
  pageTitle: string,
  parentPageId?: string
): AsyncGenerator<ProgressEvent> {
  const client = new NotionClient({ accessToken });
  const rateLimiter = new RateLimiter();

  const databases: Map<string, DatabaseInfo> = new Map();

  // Calculate total steps
  const relationCount = schema.databases.reduce(
    (sum, db) => sum + db.properties.filter((p) => p.type === "relation").length,
    0
  );
  const totalSteps = 1 + schema.databases.length + relationCount; // Parent page + DBs + relations
  let currentStep = 0;

  try {
    // PHASE 1: Create parent page in workspace
    currentStep++;
    yield {
      step: currentStep,
      totalSteps,
      phase: "creating_parent",
      message: `Creating parent page: ${pageTitle}`,
      status: "in_progress",
    };

    const parentPage = await rateLimiter.execute(() =>
      client.createPage({
        parent: parentPageId
          ? {
              type: "page_id",
              page_id: parentPageId,
            }
          : {
              type: "workspace",
              workspace: true,
            },
        properties: {
          title: {
            title: [
              {
                type: "text",
                text: { content: pageTitle },
              },
            ],
          },
        },
      })
    );

    const createdPageId = parentPage.id;

    yield {
      step: currentStep,
      totalSteps,
      phase: "creating_parent",
      message: `Created parent page: ${pageTitle}`,
      status: "success",
    };

    // PHASE 2: Create databases (without relations)
    for (const database of schema.databases) {
      currentStep++;
      yield {
        step: currentStep,
        totalSteps,
        phase: "creating_databases",
        message: `Creating ${database.name} database`,
        databaseName: database.name,
        status: "in_progress",
      };

      const properties = databasePropertiesToNotionFormat(database);

      const dbResponse = await rateLimiter.execute(() =>
        client.createDatabase({
          parent: {
            type: "page_id",
            page_id: createdPageId,
          },
          title: [
            {
              type: "text",
              text: { content: database.name },
            },
          ],
          ...(database.icon && {
            icon: { type: "emoji", emoji: database.icon },
          }),
          properties,
        })
      );

      // Extract data_source_id
      const dataSourceId = dbResponse.id; // In newer API, DB ID = data source ID

      databases.set(database.key, {
        key: database.key,
        name: database.name,
        databaseId: dbResponse.id,
        dataSourceId,
      });

      yield {
        step: currentStep,
        totalSteps,
        phase: "creating_databases",
        message: `Created ${database.name} database`,
        databaseName: database.name,
        status: "success",
      };
    }

    // PHASE 3: Add relations via PATCH
    for (const database of schema.databases) {
      const dbInfo = databases.get(database.key);
      if (!dbInfo) continue;

      // Get relation properties
      const relationProperties = database.properties.filter(
        (p) => p.type === "relation"
      );

      for (const property of relationProperties) {
        if (!property.relation) continue;

        currentStep++;
        yield {
          step: currentStep,
          totalSteps,
          phase: "adding_relations",
          message: `Adding relation: ${property.name}`,
          detail: `Linking ${database.name} to ${property.relation.targetDatabaseKey}`,
          status: "in_progress",
        };

        const targetDb = databases.get(property.relation.targetDatabaseKey);
        if (!targetDb) {
          throw new Error(
            `Target database ${property.relation.targetDatabaseKey} not found`
          );
        }

        const relationPropertyDef = createRelationProperty(
          property,
          targetDb.dataSourceId
        );

        await rateLimiter.execute(() =>
          client.updateDataSource(dbInfo.dataSourceId, {
            properties: relationPropertyDef,
          })
        );

        yield {
          step: currentStep,
          totalSteps,
          phase: "adding_relations",
          message: `Added relation: ${property.name}`,
          status: "success",
        };
      }
    }

    // COMPLETE
    yield {
      step: totalSteps,
      totalSteps,
      phase: "complete",
      message: "CRM created successfully!",
      status: "success",
      detail: `Created ${databases.size} databases with ${relationCount} relations`,
    };
  } catch (error: any) {
    yield {
      step: currentStep,
      totalSteps,
      phase: "error",
      message: "Failed to create CRM",
      status: "error",
      error: error.message || "Unknown error",
    };
    throw error;
  }
}
