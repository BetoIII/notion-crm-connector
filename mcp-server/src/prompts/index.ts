import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  server.prompt(
    "add-contact-from-email",
    "Parse an email to extract contact information and add them to the CRM",
    { email_text: z.string().describe("The email text to parse") },
    async (args) => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Please parse the following email to extract contact information, then use the parse_email_to_contact tool with auto_create=true to add them to the CRM.

If the tool doesn't extract enough information, manually identify the name, email, title, company, and phone from the email text and use create_contact instead.

Email text:
---
${args.email_text}
---`,
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "weekly-pipeline-review",
    "Run a comprehensive weekly pipeline review",
    {},
    async () => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Please run a comprehensive weekly pipeline review:

1. First, run get_pipeline to see the current pipeline breakdown by stage
2. Then run stalled_deals with days=7 to find deals that haven't moved this week
3. Then run contacts_needing_followup with days=7 to find contacts that need attention
4. Finally, run pipeline_summary for aggregate statistics

After gathering all data, provide a summary with:
- Pipeline health overview (total value, weighted value, deal count)
- Stage-by-stage breakdown
- Deals that need attention (stalled or at risk)
- Contacts that need follow-up this week
- Recommended actions for the week ahead`,
            },
          },
        ],
      };
    }
  );

  server.prompt(
    "qualify-opportunity",
    "Evaluate and qualify an opportunity in the CRM",
    { opportunity_name: z.string().describe("Name of the opportunity to qualify") },
    async (args) => {
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: `Please qualify the opportunity "${args.opportunity_name}":

1. Search for the opportunity using search_opportunities
2. Get the account overview using get_account_overview for the linked account
3. Check the activity history using get_activity_history for the opportunity

Then evaluate against these qualification criteria:
- **Champion identified?** Is there a contact with Buying Role = Champion linked to the deal?
- **Economic Buyer identified?** Is there a contact with Buying Role = Economic Buyer?
- **Close date realistic?** Is the Expected Close Date reasonable given the current stage?
- **Probability aligned?** Does the Close Probability match the stage defaults?
- **Next steps defined?** Is there a clear Next Step?
- **Recent activity?** Has there been activity in the last 14 days?
- **Deal value set?** Is the Deal Value populated?

Provide a qualification score (out of 7) and specific recommendations for what needs to be done to strengthen this deal.`,
            },
          },
        ],
      };
    }
  );
}
