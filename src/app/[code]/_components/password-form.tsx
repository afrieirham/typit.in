"use client";
import { redirect } from "next/navigation";
import React, { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

import { FileDisplay } from "./file-display";
import { NoteDisplay } from "./note-display";
import { ErrorDialog } from "@/components/error-dialog";

export function PasswordForm({ code }: { code: string }) {
  const link = api.link.getLinkInfoWithPassword.useMutation({
    onSuccess: (data) => {
      const { destinationUrl, fileName, content } = data;
      setDestinationUrl(destinationUrl);
      setFileName(fileName);
      setContent(content);
      setLoading(false);
    },
    onError: () => {
      setErrorMessage("something went wrong");
      setLoading(false);
    },
  });

  const [destinationUrl, setDestinationUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [content, setContent] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) return;

    setLoading(true);
    link.mutate({ code, password });
  };

  if (destinationUrl) {
    redirect(destinationUrl);
  }

  if (fileName) {
    return <FileDisplay fileName={fileName} />;
  }

  if (content) {
    return <NoteDisplay content={content} />;
  }

  return (
    <div className="container mx-auto my-8 max-w-lg p-2">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="mb-2 text-2xl font-bold">typit.in</h1>
          <p className="mb-6 text-gray-600">
            short and catchy temporary url to share links, files, or notes.
          </p>
        </div>

        <form className="space-y-2" onSubmit={onSubmit}>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="password"
          />
          <Button
            loading={loading}
            disabled={loading}
            type="submit"
            className="w-full"
          >
            Submit
          </Button>
        </form>
      </div>
      <ErrorDialog
        errorMessage={errorMessage}
        onClickAction={() => setErrorMessage("")}
      />
    </div>
  );
}
