"use client";
import { useState } from "react";

import copy from "copy-to-clipboard";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHostName } from "@/hooks/useHostName";

import FileStorageForm from "./_components/file-storage-form";
import TextSharingForm from "./_components/text-sharing-form";
import UrlShortenerForm from "./_components/url-shortener-form";

type FormType = "url" | "file" | "text";

export default function Home() {
  const hostname = useHostName();

  const [selectedForm, setSelectedForm] = useState<FormType>("url");

  const [copied, setCopied] = useState(false);
  const [linkCode, setLinkCode] = useState("sample");

  const title = {
    url: "url shortener",
    file: "file storage",
    text: "text sharing",
  };

  const copyToClipboard = async () => {
    copy(`${hostname}/${linkCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto max-w-lg px-3 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">typit.in</h1>
        <p className="mb-6 text-gray-600">
          catchiest temporary url for {title[selectedForm]}
        </p>
        <div className="flex space-x-2">
          <Button
            variant={selectedForm === "url" ? "default" : "outline"}
            onClick={() => setSelectedForm("url")}
            className="flex-1"
          >
            URL Shortener
          </Button>
          <Button
            variant={selectedForm === "file" ? "default" : "outline"}
            onClick={() => setSelectedForm("file")}
            className="flex-1"
          >
            File Storage
          </Button>
          <Button
            variant={selectedForm === "text" ? "default" : "outline"}
            onClick={() => setSelectedForm("text")}
            className="flex-1"
          >
            Text Sharing
          </Button>
        </div>
      </div>

      <div>
        {selectedForm === "url" && <UrlShortenerForm />}
        {selectedForm === "file" && <FileStorageForm />}
        {selectedForm === "text" && <TextSharingForm />}
      </div>

      <div className="mt-8 border-t pt-6 text-center">
        <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-6">
          <a
            href={`${hostname}/${linkCode}`}
            className="cursor-pointer font-mono text-2xl leading-relaxed font-bold break-all text-gray-800 hover:underline"
          >
            typit.in/{linkCode}
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
    </div>
  );
}
