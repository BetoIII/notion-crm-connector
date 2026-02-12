import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CreateCRMFlow } from "@/components/dashboard/create-crm-flow";
import { MessageTemplatesSection } from "@/components/messages/message-templates-section";
import { SendSMSFlowStepper } from "@/components/messages/send-sms-flow-stepper";
import { ContactsPage } from "@/components/contacts/contacts-page";
import { ListsPage } from "@/components/lists/lists-page";
import { McpStatusPage } from "@/components/mcp-connect/mcp-status-page";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import path from "path";

export default async function DashboardPage() {
  // For internal integration (dev mode), skip OAuth session
  // The API key is used directly in API routes
  const session = await getSession();
  const mcpPath = path.join(process.cwd(), "mcp-server");

  return (
    <div className="min-h-screen texture-shag p-8 grain-overlay">
      <div className="mx-auto max-w-7xl">
        {/* Header - Wood Panel Banner */}
        <div className="mb-8 flex items-center justify-between texture-wood border-4 border-wood-dark p-6 shadow-xl rounded">
          <div>
            <h1 className="text-3xl font-bold font-heading text-cream text-embossed">DASHBOARD</h1>
            <p className="text-cream/80 font-body text-sm mt-1">
              {session ?
                `Connected to: ${session.workspace_name || session.workspace_id}` :
                'Using internal integration (dev mode)'}
            </p>
          </div>
          {session && (
            <form action="/auth/logout" method="GET">
              <Button type="submit" variant="secondary" size="lg">
                Logout
              </Button>
            </form>
          )}
        </div>

        {/* Tabs for different sections - File Folder Style */}
        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="mb-0">
            <TabsTrigger value="connect-notion">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              Connect
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              Contacts
            </TabsTrigger>
            <TabsTrigger value="lists">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              Lists
            </TabsTrigger>
            <TabsTrigger value="crm">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="12" rx="1"/>
                <path d="M6 8V5c0-1 1-2 2-2h8c1 0 2 1 2 2v3"/>
              </svg>
              CRM Builder
            </TabsTrigger>
            <TabsTrigger value="messages">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="1"/>
                <line x1="6" y1="9" x2="18" y2="9"/>
                <line x1="6" y1="13" x2="15" y2="13"/>
              </svg>
              Message Templates
            </TabsTrigger>
            <TabsTrigger value="send-sms">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              Send SMS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connect-notion" className="bg-cream texture-paper card-paper p-6 rounded-b border-2 border-t-0 border-wood-light">
            <McpStatusPage mcpPath={mcpPath} />
          </TabsContent>

          <TabsContent value="contacts" className="bg-cream texture-paper card-paper p-6 rounded-b border-2 border-t-0 border-wood-light">
            <ContactsPage />
          </TabsContent>

          <TabsContent value="lists" className="bg-cream texture-paper card-paper p-6 rounded-b border-2 border-t-0 border-wood-light">
            <ListsPage />
          </TabsContent>

          <TabsContent value="crm" className="bg-cream texture-paper card-paper p-6 rounded-b border-2 border-t-0 border-wood-light">
            <CreateCRMFlow />
          </TabsContent>

          <TabsContent value="messages" className="bg-cream texture-paper card-paper p-6 rounded-b border-2 border-t-0 border-wood-light">
            <MessageTemplatesSection />
          </TabsContent>

          <TabsContent value="send-sms" className="bg-cream texture-paper card-paper p-6 rounded-b border-2 border-t-0 border-wood-light">
            <SendSMSFlowStepper />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
