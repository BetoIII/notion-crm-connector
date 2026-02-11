type NotionPage = Record<string, unknown>;
type NotionProperties = Record<string, unknown>;

function getPropertyValue(prop: unknown): string {
  if (!prop || typeof prop !== "object") return "";
  const p = prop as Record<string, unknown>;
  const type = p.type as string;

  switch (type) {
    case "title": {
      const titleArr = p.title as Array<{ plain_text: string }> | undefined;
      return titleArr?.map((t) => t.plain_text).join("") || "";
    }
    case "rich_text": {
      const textArr = p.rich_text as Array<{ plain_text: string }> | undefined;
      return textArr?.map((t) => t.plain_text).join("") || "";
    }
    case "email":
      return (p.email as string) || "";
    case "phone_number":
      return (p.phone_number as string) || "";
    case "url":
      return (p.url as string) || "";
    case "number":
      return p.number !== null && p.number !== undefined ? String(p.number) : "";
    case "select": {
      const sel = p.select as { name: string } | null;
      return sel?.name || "";
    }
    case "multi_select": {
      const ms = p.multi_select as Array<{ name: string }> | undefined;
      return ms?.map((o) => o.name).join(", ") || "";
    }
    case "date": {
      const d = p.date as { start: string; end?: string } | null;
      if (!d) return "";
      return d.end ? `${d.start} → ${d.end}` : d.start;
    }
    case "relation": {
      const rels = p.relation as Array<{ id: string }> | undefined;
      return rels?.map((r) => r.id).join(", ") || "";
    }
    case "people": {
      const people = p.people as Array<{ name?: string }> | undefined;
      return people?.map((pp) => pp.name || "Unknown").join(", ") || "";
    }
    case "checkbox":
      return p.checkbox ? "Yes" : "No";
    default:
      return "";
  }
}

export function formatPageSummary(page: NotionPage, includeId = true): string {
  const properties = page.properties as NotionProperties;
  if (!properties) return `Page ID: ${(page as { id?: string }).id || "unknown"}`;

  const lines: string[] = [];
  if (includeId) {
    lines.push(`ID: ${(page as { id?: string }).id || "unknown"}`);
  }

  for (const [name, prop] of Object.entries(properties)) {
    const val = getPropertyValue(prop);
    if (val) {
      lines.push(`${name}: ${val}`);
    }
  }

  return lines.join("\n");
}

export function formatContactSummary(page: NotionPage): string {
  const props = page.properties as NotionProperties;
  if (!props) return "No properties";

  const name = getPropertyValue(props["Contact Name"]);
  const email = getPropertyValue(props["Contact Email"]);
  const title = getPropertyValue(props["Title"]);
  const phone = getPropertyValue(props["Contact Phone"]);
  const role = getPropertyValue(props["Buying Role"]);
  const engagement = getPropertyValue(props["Engagement Level"]);
  const lastContact = getPropertyValue(props["Last Contact"]);
  const id = (page as { id?: string }).id || "";

  const parts = [`**${name}**`];
  if (title) parts.push(`Title: ${title}`);
  if (email) parts.push(`Email: ${email}`);
  if (phone) parts.push(`Phone: ${phone}`);
  if (role) parts.push(`Buying Role: ${role}`);
  if (engagement) parts.push(`Engagement: ${engagement}`);
  if (lastContact) parts.push(`Last Contact: ${lastContact}`);
  parts.push(`Page ID: ${id}`);

  return parts.join("\n");
}

export function formatOpportunitySummary(page: NotionPage): string {
  const props = page.properties as NotionProperties;
  if (!props) return "No properties";

  const name = getPropertyValue(props["Name"]);
  const stage = getPropertyValue(props["Stage"]);
  const dealValue = getPropertyValue(props["Deal Value"]);
  const probability = getPropertyValue(props["Close Probability"]);
  const closeDate = getPropertyValue(props["Expected Close Date"]);
  const nextStep = getPropertyValue(props["Next Step"]);
  const id = (page as { id?: string }).id || "";

  const parts = [`**${name}**`];
  if (stage) parts.push(`Stage: ${stage}`);
  if (dealValue) parts.push(`Deal Value: $${Number(dealValue).toLocaleString()}`);
  if (probability) parts.push(`Probability: ${probability}%`);
  if (closeDate) parts.push(`Expected Close: ${closeDate}`);
  if (nextStep) parts.push(`Next Step: ${nextStep}`);
  parts.push(`Page ID: ${id}`);

  return parts.join("\n");
}

export function formatAccountSummary(page: NotionPage): string {
  const props = page.properties as NotionProperties;
  if (!props) return "No properties";

  const name = getPropertyValue(props["Company  Name"]);
  const segment = getPropertyValue(props["Segment"]);
  const companyType = getPropertyValue(props["Company Type"]);
  const city = getPropertyValue(props["City"]);
  const state = getPropertyValue(props["State"]);
  const id = (page as { id?: string }).id || "";

  const parts = [`**${name}**`];
  if (segment) parts.push(`Segment: ${segment}`);
  if (companyType) parts.push(`Type: ${companyType}`);
  if (city || state) parts.push(`Location: ${[city, state].filter(Boolean).join(", ")}`);
  parts.push(`Page ID: ${id}`);

  return parts.join("\n");
}

export function formatActivitySummary(page: NotionPage): string {
  const props = page.properties as NotionProperties;
  if (!props) return "No properties";

  const name = getPropertyValue(props["Activity Name"]);
  const type = getPropertyValue(props["Type"]);
  const status = getPropertyValue(props["Status"]);
  const date = getPropertyValue(props["Date"]);
  const notes = getPropertyValue(props["Notes"]);
  const id = (page as { id?: string }).id || "";

  const parts = [`**${name}**`];
  if (type) parts.push(`Type: ${type}`);
  if (status) parts.push(`Status: ${status}`);
  if (date) parts.push(`Date: ${date}`);
  if (notes) parts.push(`Notes: ${notes}`);
  parts.push(`Page ID: ${id}`);

  return parts.join("\n");
}
