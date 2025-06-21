"use client";

import type React from "react";
import { useRef, useState } from "react";

import axios from "axios";
import Turnstile from "react-turnstile";

import { DurationDropdown } from "@/components/duration-dropdown";
import { ErrorDialog } from "@/components/error-dialog";
import { LinkDisplay } from "@/components/link-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { env } from "@/env";
import { api } from "@/trpc/react";

const INITIAL_VALUE = {
  duration: "5",
  password: "",
};

export function FileStorageForm() {
  const inputFile = useRef<HTMLInputElement>(null);
  const trpcContext = api.useUtils();

  const [formData, setFormData] = useState(INITIAL_VALUE);
  const [code, setCode] = useState("");
  const [cfToken, setCfToken] = useState("");

  const [errorMessage, setErrorMessage] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const createFileLink = api.link.createFileLink.useMutation({
    onSuccess: (data) => {
      setCode(data);
      setFormData(INITIAL_VALUE);
      void trpcContext.link.getLinksAnalytics.invalidate();
    },
    onError: (error) => {
      setErrorMessage(error.message || "An unexpected error occurred.");
    },
  });

  const getSignedUrlMutation = api.r2.getSignedUploadUrl.useMutation({
    onSuccess: async (data) => {
      setUploadStatus("Uploading...");
      try {
        if (!selectedFile) {
          setUploadStatus("Error: No file selected for upload.");
          return;
        }

        await axios.put(data.signedUrl, selectedFile, {
          headers: {
            "Content-Type": selectedFile.type,
          },
        });

        setUploadStatus(`Upload successful!`);
        setSelectedFile(null);
        if (inputFile.current) {
          inputFile.current.value = "";
        }

        createFileLink.mutate({
          duration: Number(formData.duration),
          fileName: data.fileName,
          password: formData.password,
          cfToken,
          originalFileName: data.originalFileName,
        });
      } catch (error) {
        console.error("Error during direct upload to R2:", error);
        setUploadStatus(
          `Upload failed: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    },
    onError: (error) => {
      console.log(error);
      setUploadStatus(
        `Failed to get signed URL from backend: ${error.message}`,
      );
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadStatus("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadStatus("Please select a file first.");
      return;
    }

    await getSignedUrlMutation.mutateAsync({
      fileName: selectedFile.name,
      fileType: selectedFile.type,
    });
  };

  const isLoading = getSignedUrlMutation.isPending;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div>
      <form onSubmit={handleUpload} className="space-y-2">
        <div className="">
          <Input
            ref={inputFile}
            onChange={handleFileChange}
            className="text-sm"
            type="file"
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
          loading={isLoading}
          type="submit"
          className="mt-8 h-10 w-full"
          disabled={isLoading}
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
      <p className="text-xs text-gray-500">{uploadStatus}</p>

      <LinkDisplay code={code} />

      <ErrorDialog
        errorMessage={errorMessage}
        onClickAction={() => setErrorMessage("")}
      />
    </div>
  );
}
