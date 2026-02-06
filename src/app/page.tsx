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
    <main className="relative min-h-screen overflow-hidden bg-cream texture-wood grain-overlay">
      {/* 80s Office Background */}
      <div className="absolute inset-0 -z-10">
        {/* Wood paneling effect */}
        <div className="absolute inset-0 effect-scanlines opacity-30" />

        {/* Vintage office elements - subtle illustrations */}
        <div className="absolute right-[10%] top-[15%] opacity-5">
          <svg width="120" height="120" viewBox="0 0 24 24" fill="none" className="text-wood-dark">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
            {/* Rotary dial holes */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
              const angle = (i * 36 - 90) * (Math.PI / 180);
              const x = 12 + 6 * Math.cos(angle);
              const y = 12 + 6 * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="0.8" fill="currentColor" />;
            })}
          </svg>
        </div>

        {/* Index card stack */}
        <div className="absolute left-[15%] bottom-[20%] opacity-5">
          <div className="relative">
            <div className="absolute w-32 h-20 bg-cream border-2 border-wood-dark transform rotate-3" />
            <div className="absolute w-32 h-20 bg-cream border-2 border-wood-dark transform rotate-1" />
            <div className="absolute w-32 h-20 bg-cream border-2 border-wood-dark" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 py-12">
        {/* Logo/Brand Mark - Rotary Card Filer */}
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded border-4 border-wood-medium texture-wood shadow-xl">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-14 w-14 text-amber-glow drop-shadow-lg"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Rotary file icon */}
            <rect x="3" y="8" width="18" height="12" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
            <path d="M6 8 L6 5 C6 4 7 3 8 3 L16 3 C17 3 18 4 18 5 L18 8" stroke="currentColor" strokeWidth="2" fill="none"/>
            <line x1="7" y1="12" x2="17" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="7" y1="15" x2="14" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="18" r="1.5" fill="currentColor"/>
          </svg>
        </div>

        {/* Hero Content */}
        <div className="text-center">
          <h1 className="mb-4 text-5xl font-bold font-heading tracking-tight sm:text-6xl lg:text-7xl text-charcoal text-embossed">
            <span className="text-wood-dark">
              NOTION CRM
            </span>
            <br />
            <span className="text-amber-glow drop-shadow-lg">
              CONNECTOR
            </span>
          </h1>

          <p className="mx-auto mb-3 max-w-2xl text-lg font-body text-smoke sm:text-xl">
            Create and manage personal CRMs in your Notion workspace
          </p>

          <p className="mx-auto mb-12 max-w-xl text-sm font-body text-smoke/80">
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

            <p className="text-xs font-body text-smoke/60">
              Using internal integration (dev mode)
            </p>
          </div>
        </div>

        {/* Feature Pills - Office Sign Style */}
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          {[
            "3 Connected Databases",
            "Smart Relations",
            "Customizable Schema",
            "Real-time Creation",
          ].map((feature, i) => (
            <div
              key={feature}
              className="texture-wood border-2 border-wood-dark px-5 py-2.5 text-xs font-bold font-body uppercase tracking-wider text-cream shadow-lg transform hover:scale-105 transition-transform"
              style={{
                animationDelay: `${i * 100}ms`,
                animation: "fadeInUp 0.5s ease-out forwards",
                opacity: 0,
                borderRadius: '2px',
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
