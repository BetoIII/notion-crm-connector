"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Phone, Mail, Building2, ExternalLink } from "lucide-react";
import type { ContactData } from "@/lib/templates/types";

interface ContactResolverProps {
  onContactResolved: (url: string, contact: ContactData) => void;
}

export function ContactResolver({ onContactResolved }: ContactResolverProps) {
  const [notionUrl, setNotionUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [contact, setContact] = useState<ContactData | null>(null);

  const handleFetch = async () => {
    if (!notionUrl.trim()) {
      setError("Please enter a Notion page URL");
      return;
    }

    setError("");
    setIsLoading(true);
    setContact(null);

    try {
      const response = await fetch(
        `/api/notion/contact?url=${encodeURIComponent(notionUrl.trim())}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch contact");
      }

      setContact(data.contact);
      onContactResolved(notionUrl.trim(), data.contact);
    } catch (err: any) {
      setError(err.message || "Failed to fetch contact data");
      setContact(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleFetch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="notion-url">Contact Notion URL</Label>
        <div className="flex gap-2">
          <Input
            id="notion-url"
            placeholder="https://notion.so/Contact-Name-abc123..."
            value={notionUrl}
            onChange={(e) => setNotionUrl(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={handleFetch} disabled={isLoading || !notionUrl.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Fetch Contact
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Paste the URL of a contact page from your Notion CRM
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {contact && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold">Contact Information</h4>
            <Badge variant="outline">Resolved</Badge>
          </div>

          <div className="space-y-3">
            {contact.contact_name && (
              <div className="flex items-start gap-2">
                <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium">{contact.contact_name}</p>
                  {(contact.first_name || contact.last_name) && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      First: {contact.first_name || "(auto)"} | Last: {contact.last_name || "(auto)"}
                    </p>
                  )}
                </div>
              </div>
            )}

            {contact.phone && (
              <div className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium">{contact.phone}</p>
                </div>
              </div>
            )}

            {contact.email && (
              <div className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{contact.email}</p>
                </div>
              </div>
            )}

            {contact.company && (
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Company</p>
                  <p className="text-sm font-medium">{contact.company}</p>
                </div>
              </div>
            )}

            {!contact.contact_name &&
              !contact.phone &&
              !contact.email &&
              !contact.company && (
                <p className="text-sm text-muted-foreground">
                  No standard contact fields found in this page
                </p>
              )}
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <a
              href={notionUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              Open in Notion
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
