"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import FileStorageForm from "../app/_components/file-storage-form";
import TextSharingForm from "../app/_components/text-sharing-form";
import UrlShortenerForm from "../app/_components/url-shortener-form";

type FormType = "url" | "file" | "text";

function FormSelector({ initial = "url" }: { initial: FormType }) {
  const [selectedForm, setSelectedForm] = useState<FormType>(initial);

  const title = {
    url: "links",
    file: "files",
    text: "notes",
  };

  return (
    <div className="container mx-auto max-w-lg px-3 py-10">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">typit.in</h1>
        <p className="mb-6 text-gray-600">
          short and catchy temporary url to share {title[selectedForm]}
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
    </div>
  );
}

export default FormSelector;
