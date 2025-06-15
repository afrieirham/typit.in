"use client";

import type React from "react";
import { useRef, useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import axios from "axios";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import LinkDisplay from "./link-display";

const INITIAL_VALUE = "duration-5";

function FileStorageForm() {
  const [parent] = useAutoAnimate();
  const inputFile = useRef<HTMLInputElement>(null);

  const [limit, setLimit] = useState(INITIAL_VALUE);
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  const createFileLink = api.link.createFileLink.useMutation({
    onSuccess: (data) => {
      setCode(data);
      setLimit(INITIAL_VALUE);
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
          limit,
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
        <div className="">
          <Select
            name="limit"
            value={limit}
            onValueChange={(value) => setLimit(value)}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="select expiry method" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>by duration</SelectLabel>
                <SelectItem value="duration-5">5 minutes</SelectItem>
                <SelectItem value="duration-30">30 minutes</SelectItem>
                <SelectItem value="duration-60">1 hour</SelectItem>
                <SelectItem value="duration-360">6 hours</SelectItem>
                <SelectItem value="duration-720">12 hours</SelectItem>
                <SelectItem value="duration-1440">24 hours</SelectItem>
                <SelectLabel>by visits</SelectLabel>
                <SelectItem value="visit-1">1 visit</SelectItem>
                <SelectItem value="visit-5">5 visits</SelectItem>
                <SelectItem value="visit-10">10 visits</SelectItem>
                <SelectItem value="visit-50">50 visits</SelectItem>
                <SelectItem value="visit-100">100 visits</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
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
      <div ref={parent}>
        <LinkDisplay code={code} />
      </div>
      <AlertDialog open={!!errorMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Opps, sorry!</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage || "Something went wrong."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorMessage("")}>
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default FileStorageForm;
