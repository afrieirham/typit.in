"use client";

import { useState } from "react";

import { ClipboardPenLine, CloudUpload, Link } from "lucide-react";

import { FileStorageForm } from "@/components/forms/file-storage-form";
import { TextSharingForm } from "@/components/forms/text-sharing-form";
import { UrlShortenerForm } from "@/components/forms/url-shortener-form";
import { Button } from "@/components/ui/button";
import { Pulse } from "@/components/ui/pulse";
import { api } from "@/trpc/react";

type FormType = "url" | "file" | "text";
const title = {
  url: "links",
  file: "files",
  text: "notes",
};

export function FormSelector({ initial = "url" }: { initial: FormType }) {
  const [selectedForm, setSelectedForm] = useState<FormType>(initial);
  const analytics = api.link.getLinksAnalytics.useQuery();

  return (
    <div className="container mx-auto max-w-lg px-3 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">typit.in</h1>
        <p className="mb-6 text-gray-600">
          short and catchy temporary url to share {title[selectedForm]}
        </p>
        <div className="mb-6 flex justify-center gap-4 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="relative">
              <Pulse active={!!analytics.data?.active} />
            </div>
            <span className="font-medium">{analytics.data?.active}</span>
            <span>active links</span>
          </div>
          {selectedForm === "url" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Link className="h-4 w-4" />
              <span className="font-medium">{analytics.data?.url}</span>
              <span>url shortened</span>
            </div>
          )}
          {selectedForm === "file" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CloudUpload className="h-4 w-4" />
              <span className="font-medium">{analytics.data?.file}</span>
              <span>files stored</span>
            </div>
          )}
          {selectedForm === "text" && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClipboardPenLine className="h-4 w-4" />
              <span className="font-medium">{analytics.data?.note}</span>
              <span>notes shared.</span>
            </div>
          )}
        </div>
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
    </div>
  );
}
