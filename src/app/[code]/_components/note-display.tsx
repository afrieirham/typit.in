"use client";

import Link from "next/link";
import { useState } from "react";

import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NoteDisplay({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="mt-8 p-2">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="mb-2 text-2xl font-bold">typit.in</h1>
          <p className="mb-6 text-gray-600">
            short and catchy temporary url to share links, files, or notes.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Textarea
            value={content}
            readOnly
            className="min-h-[400px] cursor-text resize-none border-gray-200 bg-gray-50 font-mono text-sm normal-case focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {content.length} characters
            </span>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="h-8"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3 w-3" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="mt-8 space-y-4 bg-gray-100 p-8 text-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Share Your Own Note
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Generate a temporary, read-only URL for your notes and more.
            </p>
          </div>
          <Button asChild>
            <Link href="/notes">Create Note</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
