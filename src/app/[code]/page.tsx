import { redirect } from "next/navigation";
import React from "react";

import { api } from "@/trpc/server";
import NotesDisplay from "./_components/notes-display";

async function DisplayPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const { destinationUrl, fileUrl, content } = await api.link.getLinkInfo({
    code,
  });

  if (destinationUrl) {
    redirect(destinationUrl);
  }

  if (fileUrl) {
    redirect(fileUrl);
  }

  if (content) {
    return <NotesDisplay content={content} />;
  }

  return null;
}

export default DisplayPage;
