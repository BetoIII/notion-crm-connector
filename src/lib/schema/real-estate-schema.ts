/**
 * Real Estate CRM schema definition
 * 3 databases: Properties, Contacts, Opportunities
 * Based on RESO Data Dictionary structure
 */

import { CRMSchema } from "./types";

export const REAL_ESTATE_SCHEMA: CRMSchema = {
  databases: [
    {
      id: crypto.randomUUID(),
      key: "properties",
      name: "Properties",
      icon: "🏠",
      description: "Real estate properties and listings",
      properties: [
        // Title
        {
          id: crypto.randomUUID(),
          name: "Property Address",
          type: "title",
        },

        // Address Fields
        {
          id: crypto.randomUUID(),
          name: "Full Address",
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
            { name: "Phoenix" },
            { name: "Denver" },
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
            { name: "AZ" },
            { name: "CO" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Postal Code",
          type: "rich_text",
        },
        {
          id: crypto.randomUUID(),
          name: "County",
          type: "rich_text",
        },

        // Structure Fields
        {
          id: crypto.randomUUID(),
          name: "Bedrooms",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Bathrooms Full",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Bathrooms Half",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Living Area (sqft)",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Lot Size (sqft)",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Year Built",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Stories",
          type: "number",
        },

        // Listing Fields
        {
          id: crypto.randomUUID(),
          name: "List Price",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Original List Price",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Status",
          type: "select",
          options: [
            { name: "Active" },
            { name: "Pending" },
            { name: "Closed" },
            { name: "Expired" },
            { name: "Withdrawn" },
            { name: "Canceled" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Days on Market",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Property Type",
          type: "select",
          options: [
            { name: "Residential" },
            { name: "Commercial" },
            { name: "Land" },
            { name: "Multi-Family" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Property Sub Type",
          type: "select",
          options: [
            { name: "Single Family" },
            { name: "Condo" },
            { name: "Townhouse" },
            { name: "Apartment" },
            { name: "Office" },
            { name: "Retail" },
            { name: "Industrial" },
            { name: "Vacant Land" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "List Date",
          type: "date",
        },
        {
          id: crypto.randomUUID(),
          name: "Public Remarks",
          type: "rich_text",
        },

        // Characteristics
        {
          id: crypto.randomUUID(),
          name: "Garage Spaces",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Pool",
          type: "select",
          options: [
            { name: "Yes" },
            { name: "No" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "View",
          type: "multi_select",
          options: [
            { name: "Mountain" },
            { name: "Ocean" },
            { name: "City" },
            { name: "Lake" },
            { name: "Golf Course" },
            { name: "Park" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Heating",
          type: "multi_select",
          options: [
            { name: "Central" },
            { name: "Forced Air" },
            { name: "Heat Pump" },
            { name: "Radiant" },
            { name: "None" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Cooling",
          type: "multi_select",
          options: [
            { name: "Central Air" },
            { name: "Wall Unit" },
            { name: "Evaporative" },
            { name: "None" },
          ],
        },

        // Relations
        {
          id: crypto.randomUUID(),
          name: "👤 Contacts",
          type: "relation",
          relation: {
            targetDatabaseKey: "contacts",
            syncedPropertyName: "🏠 Properties",
          },
        },
        {
          id: crypto.randomUUID(),
          name: "💼 Opportunities",
          type: "relation",
          relation: {
            targetDatabaseKey: "opportunities",
            syncedPropertyName: "🏠 Property",
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
            { name: "Referral" },
            { name: "Open House" },
            { name: "MLS" },
            { name: "Zillow" },
            { name: "Realtor.com" },
            { name: "Social Media" },
            { name: "Past Client" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Last Contact",
          type: "date",
        },
        {
          id: crypto.randomUUID(),
          name: "Agent",
          type: "people",
        },
        {
          id: crypto.randomUUID(),
          name: "🏠 Properties",
          type: "relation",
          relation: {
            targetDatabaseKey: "properties",
            syncedPropertyName: "👤 Contacts",
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
            { name: "Lead" },
            { name: "Showing Scheduled" },
            { name: "Offer Pending" },
            { name: "Under Contract" },
            { name: "Closed Won" },
            { name: "Closed Lost" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Opportunity Type",
          type: "select",
          options: [
            { name: "Buyer" },
            { name: "Seller" },
            { name: "Rental" },
            { name: "Lease" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Lead Source",
          type: "multi_select",
          options: [
            { name: "Referral" },
            { name: "Open House" },
            { name: "MLS" },
            { name: "Zillow" },
            { name: "Realtor.com" },
            { name: "Social Media" },
            { name: "Past Client" },
            { name: "Inbound" },
            { name: "Outbound" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Lost Reason",
          type: "select",
          options: [
            { name: "Price" },
            { name: "Location" },
            { name: "Timing" },
            { name: "Competitor" },
            { name: "Financing" },
            { name: "Inspection Issues" },
          ],
        },
        {
          id: crypto.randomUUID(),
          name: "Deal Value",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Commission Rate (%)",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Expected Commission",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Close Probability",
          type: "number",
        },
        {
          id: crypto.randomUUID(),
          name: "Expected Close Date",
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
          name: "🏠 Property",
          type: "relation",
          relation: {
            targetDatabaseKey: "properties",
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
 * Get a fresh copy of the real estate schema with new UUIDs
 */
export function getRealEstateSchema(): CRMSchema {
  return JSON.parse(JSON.stringify(REAL_ESTATE_SCHEMA));
}
