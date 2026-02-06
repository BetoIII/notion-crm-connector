import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CreateCRMFlow } from "@/components/dashboard/create-crm-flow";
import { MessageTemplatesSection } from "@/components/messages/message-templates-section";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function DashboardPage() {
  // For internal integration (dev mode), skip OAuth session
  // The API key is used directly in API routes
  const session = await getSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {session ?
                `Connected to: ${session.workspace_name || session.workspace_id}` :
                'Using internal integration (dev mode)'}
            </p>
          </div>
          {session && (
            <form action="/auth/logout" method="GET">
              <Button type="submit" variant="outline" size="lg">
                Logout
              </Button>
            </form>
          )}
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="crm" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="crm">CRM Builder</TabsTrigger>
            <TabsTrigger value="messages">Message Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="crm">
            <CreateCRMFlow />
          </TabsContent>

          <TabsContent value="messages">
            <MessageTemplatesSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
