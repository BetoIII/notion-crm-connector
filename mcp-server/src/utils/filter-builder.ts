import { resolveSelectAlias } from "./aliases.js";

export interface FilterSpec {
  property: string;
  type: "text" | "email" | "select" | "multi_select" | "number" | "date" | "relation" | "checkbox";
  condition: string;
  value?: string | number;
}

export interface CompoundFilterSpec {
  type: "compound";
  operator: "and" | "or";
  filters: (FilterSpec | CompoundFilterSpec)[];
}

type NotionFilter = Record<string, unknown>;

export function buildNotionFilter(
  spec: FilterSpec | CompoundFilterSpec
): NotionFilter {
  if (spec.type === "compound") {
    const compound = spec as CompoundFilterSpec;
    return {
      [compound.operator]: compound.filters.map((f) => buildNotionFilter(f)),
    };
  }

  const filter = spec as FilterSpec;
  return buildSingleFilter(filter);
}

function buildSingleFilter(filter: FilterSpec): NotionFilter {
  const { property, type, condition, value } = filter;

  switch (type) {
    case "text":
    case "email":
      return {
        property,
        [type === "email" ? "email" : "rich_text"]: {
          [condition]: value,
        },
      };

    case "select": {
      const resolvedValue = value ? resolveSelectAlias(property, String(value)) : value;
      if (condition === "is_empty") {
        return { property, select: { is_empty: true } };
      }
      if (condition === "is_not_empty") {
        return { property, select: { is_not_empty: true } };
      }
      return {
        property,
        select: { [condition]: resolvedValue },
      };
    }

    case "multi_select":
      if (condition === "is_empty") {
        return { property, multi_select: { is_empty: true } };
      }
      if (condition === "is_not_empty") {
        return { property, multi_select: { is_not_empty: true } };
      }
      return {
        property,
        multi_select: { [condition]: value },
      };

    case "number":
      return {
        property,
        number: { [condition]: Number(value) },
      };

    case "date":
      if (condition === "is_empty") {
        return { property, date: { is_empty: true } };
      }
      if (condition === "is_not_empty") {
        return { property, date: { is_not_empty: true } };
      }
      return {
        property,
        date: { [condition]: value },
      };

    case "relation":
      if (condition === "is_empty") {
        return { property, relation: { is_empty: true } };
      }
      if (condition === "is_not_empty") {
        return { property, relation: { is_not_empty: true } };
      }
      return {
        property,
        relation: { [condition]: value },
      };

    case "checkbox":
      return {
        property,
        checkbox: { [condition]: value },
      };

    default:
      throw new Error(`Unsupported filter type: ${type}`);
  }
}

export function buildTitleFilter(property: string, value: string): NotionFilter {
  return {
    property,
    title: { equals: value },
  };
}

export function buildTitleContainsFilter(property: string, value: string): NotionFilter {
  return {
    property,
    title: { contains: value },
  };
}

export function buildEmailFilter(property: string, value: string): NotionFilter {
  return {
    property,
    email: { equals: value },
  };
}
