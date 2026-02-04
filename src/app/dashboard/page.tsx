import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { CreateCRMFlow } from "@/components/dashboard/create-crm-flow";
import { Button } from "@/components/ui/button";

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

        {/* Schema Editor + Creation Flow */}
        <CreateCRMFlow />
      </div>
    </div>
  );
}
