"use client";

import type React from "react";
import { useState } from "react";

import Turnstile from "react-turnstile";

import { DurationDropdown } from "@/components/duration-dropdown";
import { ErrorDialog } from "@/components/error-dialog";
import { LinkDisplay } from "@/components/link-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { api } from "@/trpc/react";

const INITIAL_VALUE = {
  url: "",
  duration: "5",
  password: "",
};

export function UrlShortenerForm() {
  const trpcContext = api.useUtils();

  const [formData, setFormData] = useState(INITIAL_VALUE);
  const [code, setCode] = useState("");
  const [cfToken, setCfToken] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const create = api.link.createShortLink.useMutation({
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
      destinationUrl: formData.url,
      password: formData.password,
      cfToken,
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
          <Input
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://youtu.be/dQw4w9WgXcQ"
            className="h-10 text-sm normal-case"
            type="url"
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

        <Input
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="password (leave blank if not needed)"
        />

        <Button
          loading={loading}
          disabled={loading}
          type="submit"
          className="mt-8 h-10 w-full"
        >
          Generate
        </Button>

        <Turnstile
          sitekey={env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY}
          onVerify={(token) => setCfToken(token)}
          onExpire={() => setCfToken("")}
          onError={() => setCfToken("")}
          theme="light"
        />
      </form>

      <LinkDisplay code={code} />
      <ErrorDialog
        errorMessage={errorMessage}
        onClickAction={() => setErrorMessage("")}
      />
    </div>
  );
}
