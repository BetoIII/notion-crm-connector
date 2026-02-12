"use client";

import { useState } from "react";
import { Check, Copy, FileCode2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ConfigSnippetProps {
  mcpServerPath: string;
}

export function ConfigSnippet({ mcpServerPath }: ConfigSnippetProps) {
  const [copied, setCopied] = useState(false);

  const whatsappMcpPath = mcpServerPath.replace(/mcp-server$/, "whatsapp-mcp/whatsapp-mcp-server");

  const configJson = JSON.stringify(
    {
      mcpServers: {
        "notion-crm": {
          command: "node",
          args: [`${mcpServerPath}/build/index.js`],
          env: {
            NOTION_API_KEY: "your-notion-api-key-here",
          },
        },
        "whatsapp": {
          command: "uv",
          args: [
            "--directory",
            whatsappMcpPath,
            "run",
            "main.py",
          ],
        },
      },
    },
    null,
    2
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configJson);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select text
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="config" className="border-b-0">
        <AccordionTrigger className="texture-wood border-2 border-wood-dark rounded-t px-5 py-3 hover:no-underline group data-[state=closed]:rounded-b">
          <div className="flex items-center gap-3">
            <FileCode2 className="h-4 w-4 text-cream" />
            <span className="font-heading text-sm font-bold uppercase tracking-wider text-cream text-embossed">
              Claude Desktop Configuration
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="p-0">
          <div className="texture-paper card-paper rounded-b border-2 border-t-0 border-wood-light overflow-hidden">
            {/* Typewriter header */}
            <div className="flex items-center justify-between border-b border-wood-light/40 px-5 py-3 bg-tan/10">
              <p className="text-xs font-body text-smoke">
                Add to{" "}
                <code className="font-mono text-amber-dim font-semibold">
                  claude_desktop_config.json
                </code>
              </p>
              <Button
                onClick={handleCopy}
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-smoke hover:text-charcoal"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-olive" />
                    <span className="text-olive text-xs ml-1">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span className="text-xs ml-1">Copy</span>
                  </>
                )}
              </Button>
            </div>

            {/* Code block - typewriter style */}
            <div className="p-5">
              <pre className="overflow-x-auto rounded border border-wood-light/30 bg-cream p-4 font-mono text-xs leading-relaxed text-charcoal">
                {configJson}
              </pre>
              <p className="mt-3 text-[11px] font-body text-smoke/70 text-center">
                Replace &quot;your-notion-api-key-here&quot; with your Notion internal
                integration token. For WhatsApp, run{" "}
                <code className="font-mono text-amber-dim">npm run setup:whatsapp</code>{" "}
                first and ensure{" "}
                <code className="font-mono text-amber-dim">uv</code>{" "}
                is installed.
              </p>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
