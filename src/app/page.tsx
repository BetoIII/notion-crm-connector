"use client";

import { useSearchParams } from "next/navigation";
import { ConnectNotionButton } from "@/components/auth/connect-notion-button";
import { AlertCircle } from "lucide-react";
import { Suspense } from "react";

function ErrorMessage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  const errorMessages: Record<string, string> = {
    missing_parameters: "Missing authorization parameters",
    invalid_state: "Invalid session state. Please try again.",
    authentication_failed: "Authentication failed. Please try again.",
  };

  return (
    <div className="mb-8 flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <AlertCircle className="h-5 w-5 flex-shrink-0" />
      <p>{errorMessages[error] || "An error occurred. Please try again."}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

        {/* Floating geometric accents */}
        <div className="absolute right-[10%] top-[15%] h-64 w-64 rounded-full bg-primary/5 blur-3xl animate-float" />
        <div className="absolute left-[15%] bottom-[20%] h-48 w-48 rounded-full bg-secondary/5 blur-3xl animate-float-delayed" />
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        {/* Logo/Brand Mark - Minimalist Icon */}
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-10 w-10 text-primary"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6h16M4 12h16M4 18h16M8 6v12M16 6v12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Hero Content */}
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Notion CRM
            </span>
            <br />
            <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
              Connector
            </span>
          </h1>

          <p className="mx-auto mb-3 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Create and manage personal CRMs in your Notion workspace
          </p>

          <p className="mx-auto mb-12 max-w-xl text-sm text-muted-foreground/80">
            Build structured databases for accounts, contacts, and opportunities—all
            connected with intelligent relations
          </p>

          {/* Error Display */}
          <Suspense fallback={null}>
            <ErrorMessage />
          </Suspense>

          {/* CTA */}
          <div className="flex flex-col items-center gap-4">
            <ConnectNotionButton />

            <p className="text-xs text-muted-foreground/60">
              Using internal integration (dev mode)
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3">
          {[
            "3 Connected Databases",
            "Smart Relations",
            "Customizable Schema",
            "Real-time Creation",
          ].map((feature, i) => (
            <div
              key={feature}
              className="rounded-full border border-border bg-card/50 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm"
              style={{
                animationDelay: `${i * 100}ms`,
                animation: "fadeInUp 0.5s ease-out forwards",
                opacity: 0,
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>

      {/* Background Pattern Styles */}
      <style jsx>{`
        .bg-grid-pattern {
          background-image: linear-gradient(
              to right,
              hsl(var(--border)) 1px,
              transparent 1px
            ),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
          }
        }

        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(20px) scale(0.95);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 6s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
