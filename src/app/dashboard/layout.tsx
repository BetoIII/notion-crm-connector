import { SchemaProvider } from "@/hooks/use-schema";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // For internal integration (dev mode), no session check needed
  return <SchemaProvider>{children}</SchemaProvider>;
}
