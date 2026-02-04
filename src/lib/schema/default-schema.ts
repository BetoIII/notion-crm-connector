/**
 * Default CRM schema definition
 * 3 databases: Accounts, Contacts, Opportunities
 */

import { CRMSchema } from "./types";

export const DEFAULT_CRM_SCHEMA: CRMSchema = {
  databases: [
    {
      id: crypto.randomUUID(),
      key: "accounts",
      name: "Accounts",
      icon: "🏢",
      description: "Companies and organizations",
      properties: [
        {
          id: crypto.randomUUID(),
          name: "Company Name",
          type: "title",
        },
        {
          id: crypto.randomUUID(),
          name: "Company Type",
          type: "multi_select",
          options: [
            { name: "Mortgage Servicer" },
            { name: "Listings" },
            { name: "Lead Gen" },
            { name: "Leasing" },
            { name: "Private Lender" },
            { name: "Loan Originator" },
            { name: "Property Manager" },
            { name: "Mobile Homes" },
            { name: "Mortgage Originator" },
            { name: "Mortgage Broker" },
            { name: "RE Brokerage" },
            { name: "HELOCs" },
            { name: "RE Tech Vendor" },
            { name: "Wholesaler" },
            { name: "Refis" },
            { name: "Developer" },
            { name: "Credit/Debt" },
            { name: "Retail" },
            { name: "Homebuilder" },
            { name: "Multifamily" },
            { name: "Operator" },
            { name: "SFR" },
            { name: "Commercial" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Segment",
          type: "select",
          options: [
            { name: "SMB" },
            { name: "Enterprise" },
            { name: "Mid-Market" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Address",
          type: "rich_text",
        },
        {
          id: crypto.randomUUID(),
          name: "City",
          type: "select",
          options: [
            { name: "San Francisco" },
            { name: "Los Angeles" },
            { name: "New York" },
            { name: "Seattle" },
            { name: "Austin" },
            { name: "Miami" },
            { name: "San Jose" },
            { name: "Las Vegas" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "State",
          type: "select",
          options: [
            { name: "CA" },
            { name: "NY" },
            { name: "WA" },
            { name: "TX" },
            { name: "FL" },
            { name: "NV" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Country",
          type: "select",
          options: [{ name: "USA" }],
        },
        {
          id: crypto.randomUUID(),
          name: "LinkedIn",
          type: "url",
        },
        {
          id: crypto.randomUUID(),
          name: "Notes",
          type: "rich_text",
        },
        {
          id: crypto.randomUUID(),
          name: "Acct Lead",
          type: "people",
        },
        {
          id: crypto.randomUUID(),
          name: "⏩ Contact Database",
          type: "relation",
          relation: {
            targetDatabaseKey: "contacts",
            syncedPropertyName: "Company",
          },
        },
        {
          id: crypto.randomUUID(),
          name: "💼 Opportunities",
          type: "relation",
          relation: {
            targetDatabaseKey: "opportunities",
            syncedPropertyName: "Account",
          },
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      key: "contacts",
      name: "Contacts",
      icon: "👤",
      description: "People and decision makers",
      properties: [
        {
          id: crypto.randomUUID(),
          name: "Contact Name",
          type: "title",
        },
        {
          id: crypto.randomUUID(),
          name: "Title",
          type: "rich_text",
        },
        {
          id: crypto.randomUUID(),
          name: "Contact Email",
          type: "email",
        },
        {
          id: crypto.randomUUID(),
          name: "Contact Phone",
          type: "phone_number",
        },
        {
          id: crypto.randomUUID(),
          name: "LinkedIn",
          type: "url",
        },
        {
          id: crypto.randomUUID(),
          name: "Buying Role",
          type: "select",
          options: [
            { name: "🎯 Champion" },
            { name: "💰 Economic Buyer" },
            { name: "🔧 Technical Buyer" },
            { name: "📋 Influencer" },
            { name: "⚖️ Legal/Compliance" },
            { name: "👤 End User" },
            { name: "🚫 Blocker" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Engagement Level",
          type: "select",
          options: [
            { name: "🔥 Hot" },
            { name: "✅ Engaged" },
            { name: "😐 Neutral" },
            { name: "❄️ Cold" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Source",
          type: "multi_select",
          options: [
            { name: "SREC" },
            { name: "Lookalikes - Irvine" },
            { name: "IMN West '25" },
            { name: "Spire ABM" },
            { name: "Lookalikes - NYC" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Last Contact",
          type: "date",
        },
        {
          id: crypto.randomUUID(),
          name: "Acct Lead",
          type: "people",
        },
        {
          id: crypto.randomUUID(),
          name: "Company",
          type: "relation",
          relation: {
            targetDatabaseKey: "accounts",
            syncedPropertyName: "⏩ Contact Database",
          },
        },
        {
          id: crypto.randomUUID(),
          name: "💼 Opportunities",
          type: "relation",
          relation: {
            targetDatabaseKey: "opportunities",
            syncedPropertyName: "Buying Committee",
          },
        },
      ],
    },
    {
      id: crypto.randomUUID(),
      key: "opportunities",
      name: "Opportunities",
      icon: "🏆",
      description: "Sales pipeline and deals",
      properties: [
        {
          id: crypto.randomUUID(),
          name: "Name",
          type: "title",
        },
        {
          id: crypto.randomUUID(),
          name: "Stage",
          type: "select",
          options: [
            { name: "Discovery" },
            { name: "Qualified" },
            { name: "Demo/Pilot" },
            { name: "Proposal" },
            { name: "Negotiating" },
            { name: "Contracting" },
            { name: "Closed Won" },
            { name: "Closed Lost" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Opportunity Type",
          type: "select",
          options: [
            { name: "New Business" },
            { name: "Expansion" },
            { name: "Renewal" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Product/Service",
          type: "multi_select",
          options: [
            { name: "Lead Gen" },
            { name: "Retention" },
            { name: "Listings" },
            { name: "Appointment Setting" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Lead Source",
          type: "multi_select",
          options: [
            { name: "SREC" },
            { name: "Lookalikes - Irvine" },
            { name: "IMN West '25" },
            { name: "Spire ABM" },
            { name: "Inbound" },
            { name: "Referral" },
            { name: "Outbound" },
            { name: "Partner" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Lost Reason",
          type: "select",
          options: [
            { name: "Price" },
            { name: "No Budget" },
            { name: "Timing" },
            { name: "Competitor" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Deal Value",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "ARR",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "MRR",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Close Probability",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Contract Length",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Expected Close Date",
          type: "date",
        },
        {
          id: crypto.randomUUID(),
          name: "Contract Start Date",
          type: "date",
        },
        {
          id: crypto.randomUUID(),
          name: "Next Step",
          type: "rich_text",
        },
        {
          id: crypto.randomUUID(),
          name: "Owner",
          type: "people",
        },
        {
          id: crypto.randomUUID(),
          name: "Account",
          type: "relation",
          relation: {
            targetDatabaseKey: "accounts",
            syncedPropertyName: "💼 Opportunities",
          },
        },
        {
          id: crypto.randomUUID(),
          name: "Buying Committee",
          type: "relation",
          relation: {
            targetDatabaseKey: "contacts",
            syncedPropertyName: "💼 Opportunities",
          },
        },
        {
          id: crypto.randomUUID(),
          name: "Champion",
          type: "relation",
          relation: {
            targetDatabaseKey: "contacts",
            syncedPropertyName: "Champion Of",
          },
        },
      ],
    },
  ],
};

/**
 * Get a fresh copy of the default schema with new UUIDs
 */
export function getDefaultSchema(): CRMSchema {
  return JSON.parse(JSON.stringify(DEFAULT_CRM_SCHEMA));
}
