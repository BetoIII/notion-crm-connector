import { getSession } from "@/lib/auth/session";
import { NotionConnectPage } from "@/components/notion-connect/notion-connect-page";

export default async function NotionConnectPageRoute() {
  const session = await getSession();

  return (
    <div className="min-h-screen texture-shag p-8 grain-overlay">
      <div className="mx-auto max-w-5xl">
        <NotionConnectPage />
      </div>
    </div>
  );
}
