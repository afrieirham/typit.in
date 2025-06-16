import Link from "next/link";
import React from "react";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { env } from "@/env";

export function FileDisplay({ fileName }: { fileName: string }) {
  const fileUrl = `${env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_DOMAIN}/uploads/${fileName}`;
  return (
    <div className="my-8 p-2">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="mb-2 text-2xl font-bold">typit.in</h1>
          <p className="mb-6 text-gray-600">
            short and catchy temporary url to share links, files, or notes.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-end">
            <Button asChild size="sm" className="h-8">
              <a href={fileUrl} download>
                <Download />
                <span>Download File</span>
              </a>
            </Button>
          </div>
          <iframe src={fileUrl} className="min-h-[800px] border" />
        </div>

        <div className="mt-8 space-y-4 bg-gray-100 p-8 text-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Share Your File
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Generate a temporary, read-only URL to share your files and more.
            </p>
          </div>
          <Button asChild>
            <Link href="/files">Share File</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
