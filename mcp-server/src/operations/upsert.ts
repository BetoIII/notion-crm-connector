import { createPage } from "./create.js";
import { updatePage } from "./update.js";
import { searchByTitle, searchByEmail } from "./search.js";
import { appendRelation } from "./link.js";
import { resolveSelectAliases } from "../utils/aliases.js";
import { STAGE_PROBABILITIES } from "../schema/types.js";

type NotionPage = { id: string; properties: Record<string, unknown> };

export interface UpsertResult {
  action: "created" | "updated" | "found";
  page_id: string;
  page: unknown;
}

export async function upsertContact(
  data: Record<string, unknown>,
  accountId?: string,
  opportunityId?: string
): Promise<UpsertResult> {
  const resolved = resolveSelectAliases(data);

  // Normalize field names
  const name = (resolved["Contact Name"] || resolved["name"]) as string;
  const email = (resolved["Contact Email"] || resolved["email"]) as string | undefined;

  if (name && !resolved["Contact Name"]) {
    resolved["Contact Name"] = name;
    delete resolved["name"];
  }
  if (email && !resolved["Contact Email"]) {
    resolved["Contact Email"] = email;
    delete resolved["email"];
  }
  if (resolved["title"] && !resolved["Title"]) {
    resolved["Title"] = resolved["title"];
    delete resolved["title"];
  }
  if (resolved["phone"] && !resolved["Contact Phone"]) {
    resolved["Contact Phone"] = resolved["phone"];
    delete resolved["phone"];
  }
  if (resolved["linkedin"] && !resolved["LinkedIn"]) {
    resolved["LinkedIn"] = resolved["linkedin"];
    delete resolved["linkedin"];
  }

  // Search by email first (most reliable dedup)
  let existing: unknown | null = null;
  if (email) {
    existing = await searchByEmail("contacts", email);
  }

  // Then by name
  if (!existing && name) {
    const results = await searchByTitle("contacts", name, 1);
    if (results.length > 0) {
      existing = results[0];
    }
  }

  let result: UpsertResult;

  if (existing) {
    const page = existing as NotionPage;
    // Remove title field from updates to avoid overwriting
    const updateData = { ...resolved };
    delete updateData["Contact Name"];
    delete updateData["name"];

    if (Object.keys(updateData).length > 0) {
      const updated = await updatePage(page.id, "contacts", updateData);
      result = { action: "updated", page_id: page.id, page: updated };
    } else {
      result = { action: "found", page_id: page.id, page: existing };
    }
  } else {
    const page = (await createPage("contacts", resolved)) as NotionPage;
    result = { action: "created", page_id: page.id, page };
  }

  // Link relations (two-step)
  if (accountId) {
    await appendRelation(result.page_id, "Company", [accountId]);
  }
  if (opportunityId) {
    await appendRelation(result.page_id, "💼 Opportunities", [opportunityId]);
  }

  return result;
}

export async function upsertAccount(
  data: Record<string, unknown>
): Promise<UpsertResult> {
  const resolved = resolveSelectAliases(data);

  // Normalize: ensure Company  Name (double space)
  const name = (resolved["Company  Name"] || resolved["company_name"] || resolved["name"]) as string;
  if (name) {
    resolved["Company  Name"] = name;
    delete resolved["company_name"];
    delete resolved["name"];
  }

  // Search by company name
  if (name) {
    const results = await searchByTitle("accounts", name, 1);
    if (results.length > 0) {
      const page = results[0] as NotionPage;
      const updateData = { ...resolved };
      delete updateData["Company  Name"];

      if (Object.keys(updateData).length > 0) {
        const updated = await updatePage(page.id, "accounts", updateData);
        return { action: "updated", page_id: page.id, page: updated };
      }
      return { action: "found", page_id: page.id, page: results[0] };
    }
  }

  const page = (await createPage("accounts", resolved)) as NotionPage;
  return { action: "created", page_id: page.id, page };
}

export async function upsertOpportunity(
  data: Record<string, unknown>,
  accountId?: string,
  contactIds?: string[]
): Promise<UpsertResult> {
  const resolved = resolveSelectAliases(data);

  // Normalize field names
  const name = (resolved["Name"] || resolved["name"]) as string;
  if (name && !resolved["Name"]) {
    resolved["Name"] = name;
    delete resolved["name"];
  }

  // Set stage defaults
  const stage = resolved["Stage"] as string | undefined;
  if (stage && !resolved["Close Probability"]) {
    const prob = STAGE_PROBABILITIES[stage];
    if (prob !== undefined) {
      resolved["Close Probability"] = prob;
    }
  }

  // Search by name
  let existing: unknown | null = null;
  if (name) {
    const results = await searchByTitle("opportunities", name, 1);
    if (results.length > 0) {
      existing = results[0];
    }
  }

  let result: UpsertResult;

  if (existing) {
    const page = existing as NotionPage;
    const updateData = { ...resolved };
    delete updateData["Name"];

    if (Object.keys(updateData).length > 0) {
      const updated = await updatePage(page.id, "opportunities", updateData);
      result = { action: "updated", page_id: page.id, page: updated };
    } else {
      result = { action: "found", page_id: page.id, page: existing };
    }
  } else {
    const page = (await createPage("opportunities", resolved)) as NotionPage;
    result = { action: "created", page_id: page.id, page };
  }

  // Link relations
  if (accountId) {
    await appendRelation(result.page_id, "Account", [accountId]);
  }
  if (contactIds && contactIds.length > 0) {
    await appendRelation(result.page_id, "Buying Committee", contactIds);
  }

  return result;
}
