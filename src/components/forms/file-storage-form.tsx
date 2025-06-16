"use client";

import type React from "react";
import { useRef, useState } from "react";

import axios from "axios";

import { DurationDropdown } from "@/components/duration-dropdown";
import { ErrorDialog } from "@/components/error-dialog";
import { LinkDisplay } from "@/components/link-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

const INITIAL_VALUE = "5";

export function FileStorageForm() {
  const inputFile = useRef<HTMLInputElement>(null);

  const [duration, setDuration] = useState(INITIAL_VALUE);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const createFileLink = api.link.createFileLink.useMutation({
    onSuccess: (data) => {
      setCode(data);
      setDuration(INITIAL_VALUE);
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
          duration: Number(duration),
          fileUrl: data.publicFileUrl,
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
      fileName: `uploads/${selectedFile.name}`,
      fileType: selectedFile.type,
    });
  };

  const isLoading = getSignedUrlMutation.isPending;

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
          value={duration}
          onValueChange={(value) => setDuration(value)}
        />
        <Button
          loading={isLoading}
          type="submit"
          className="h-10 w-full"
          disabled={!selectedFile || isLoading}
        >
          Generate
        </Button>
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
