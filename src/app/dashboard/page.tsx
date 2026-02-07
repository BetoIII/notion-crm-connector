import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CreateCRMFlow } from "@/components/dashboard/create-crm-flow";
import { MessageTemplatesSection } from "@/components/messages/message-templates-section";
import { SendSMSFlowStepper } from "@/components/messages/send-sms-flow-stepper";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  // For internal integration (dev mode), skip OAuth session
  // The API key is used directly in API routes
  const session = await getSession();

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
        <Tabs defaultValue="crm" className="w-full">
          <TabsList className="mb-0">
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
