"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface ImportProgressProps {
  database: {
    id: string;
    title: string;
  } | null;
  result: {
    success: boolean;
    importedCount: number;
  } | null;
}

export function ImportProgress({ database, result }: ImportProgressProps) {
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="mb-4 h-16 w-16 animate-spin text-amber" />
        <h3 className="font-display text-xl font-bold text-wood-darkest">
          Importing Contacts...
        </h3>
        <p className="mt-2 text-sm text-wood-dark">
          Fetching and mapping contacts from {database?.title}
        </p>
      </div>
    );
  }

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <XCircle className="mb-4 h-16 w-16 text-red-600" />
        <h3 className="font-display text-xl font-bold text-wood-darkest">
          Import Failed
        </h3>
        <p className="mt-2 text-sm text-wood-dark">
          Something went wrong while importing contacts. Please try again.
        </p>
        <Link href="/dashboard/notion-connect">
          <Button className="mt-6">Try Again</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
      <h3 className="font-display text-2xl font-bold text-wood-darkest">
        Import Successful!
      </h3>
      <p className="mt-2 text-wood-dark">
        Imported <span className="font-bold text-wood-darkest">{result.importedCount}</span>{" "}
        contact{result.importedCount !== 1 ? "s" : ""} from{" "}
        <span className="font-bold text-wood-darkest">{database?.title}</span>
      </p>

      {/* Success Summary */}
      <div className="mt-8 w-full max-w-md rounded-lg border-4 border-wood-dark bg-amber/20 p-6 text-center">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-bold text-wood-darkest">{result.importedCount}</p>
            <p className="text-sm text-wood-dark">Contacts Added</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-wood-darkest">1</p>
            <p className="text-sm text-wood-dark">Database Connected</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <Link href="/dashboard?tab=contacts">
          <Button size="lg">View Contacts</Button>
        </Link>
        <Link href="/dashboard/notion-connect">
          <Button variant="outline" size="lg">
            Connect Another Database
          </Button>
        </Link>
      </div>
    </div>
  );
}
