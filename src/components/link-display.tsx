import React, { useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import copy from "copy-to-clipboard";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHostName } from "@/hooks/useHostName";

export function LinkDisplay({ code }: { code?: string }) {
  const hostname = useHostName();
  const [parent] = useAutoAnimate();

  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    copy(`${hostname}/${code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={parent}>
      {!!code && (
        <div className="mt-8 border-t pt-6 text-center">
          <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6">
            <a
              href={`${hostname}/${code}`}
              className="cursor-pointer font-mono text-2xl leading-relaxed font-bold break-all text-gray-800 hover:underline"
            >
              typit.in/{code}
            </a>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
              className="flex w-full items-center"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy URL"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
