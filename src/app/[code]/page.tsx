import { redirect } from "next/navigation";
import React from "react";

import { api } from "@/trpc/server";
import { NoteDisplay } from "./_components/note-display";
import { FileDisplay } from "./_components/file-display";

async function DisplayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const { destinationUrl, fileUrl, content } = await api.link.getLinkInfo({
    code,
  });

  if (destinationUrl) {
    redirect(destinationUrl);
  }

  if (fileUrl) {
    return <FileDisplay fileUrl={fileUrl} />;
  }

  if (content) {
    return <NoteDisplay content={content} />;
  }

  return null;
}

export default DisplayPage;
