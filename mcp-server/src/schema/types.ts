export type DatabaseKey = "contacts" | "accounts" | "opportunities" | "activities";

export interface PropertyDef {
  id: string;
  type: string;
  options?: string[];
}

export interface DatabaseDef {
  id: string;
  collection_id: string;
  name: string;
  display_name: string;
  properties: Record<string, PropertyDef>;
}

export interface CrmSchema {
  version: string;
  last_updated: string;
  last_validated: string;
  validation_config: {
    max_stale_days: number;
    auto_heal: boolean;
  };
  note: string;
  important_format_notes: Record<string, unknown>;
  property_aliases: Record<string, string>;
  select_option_aliases: Record<string, Record<string, string>>;
  database_name_mappings: Record<string, string[]>;
  databases: Record<DatabaseKey, DatabaseDef>;
  relationships: Record<string, string>;
}

export const STAGE_PROBABILITIES: Record<string, number> = {
  Discovery: 10,
  Qualified: 25,
  "Demo/Pilot": 40,
  Proposal: 60,
  Negotiating: 75,
  Contracting: 90,
  "Closed Won": 100,
  "Closed Lost": 0,
};
