"use client";

import type React from "react";
import { useState } from "react";

import { DurationDropdown } from "@/components/duration-dropdown";
import { ErrorDialog } from "@/components/error-dialog";
import { LinkDisplay } from "@/components/link-display";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

const INITIAL_VALUE = {
  content: "",
  duration: "5",
};

export function TextSharingForm() {
  const trpcContext = api.useUtils();

  const [formData, setFormData] = useState(INITIAL_VALUE);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const create = api.link.createNotesLink.useMutation({
    onSuccess: (data) => {
      setCode(data);
      setFormData(INITIAL_VALUE);
      setLoading(false);
      void trpcContext.link.getLinksAnalytics.invalidate();
    },
    onError: (error) => {
      setLoading(false);
      setErrorMessage(error.message || "An unexpected error occurred.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCode("");
    setLoading(true);
    create.mutate({
      duration: Number(formData.duration),
      content: formData.content,
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="">
          <Textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="type your notes here..."
            className="min-h-44 text-sm normal-case"
            required
          />
        </div>
        <DurationDropdown
          name="duration"
          value={formData.duration}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, duration: value }))
          }
        />
        <Button
          loading={loading}
          disabled={loading}
          type="submit"
          className="h-10 w-full"
        >
          Generate
        </Button>
      </form>

      <LinkDisplay code={code} />

      <ErrorDialog
        errorMessage={errorMessage}
        onClickAction={() => setErrorMessage("")}
      />
    </div>
  );
}
