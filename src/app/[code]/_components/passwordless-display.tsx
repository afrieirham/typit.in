import { redirect } from "next/navigation";
import React from "react";

import { api } from "@/trpc/server";
import { FileDisplay } from "./file-display";
import { NoteDisplay } from "./note-display";

export async function PasswordlessDisplay({ code }: { code: string }) {
  const linkInfo = await api.link.getLinkInfo({ code });

  const { destinationUrl, fileName, content } = linkInfo;

  if (destinationUrl) {
    redirect(destinationUrl);
  }

  if (fileName) {
    return <FileDisplay fileName={fileName} />;
  }

  if (content) {
    return <NoteDisplay content={content} />;
  }

  return null;
}
