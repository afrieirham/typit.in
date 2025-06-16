"use client";

import type React from "react";
import { useState } from "react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

import LinkDisplay from "./link-display";

const INITIAL_VALUE = {
  content: "",
  duration: "5",
};

function TextSharingForm() {
  const [formData, setFormData] = useState(INITIAL_VALUE);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const create = api.link.createNotesLink.useMutation({
    onSuccess: (data) => {
      setCode(data);
      setFormData(INITIAL_VALUE);
      setLoading(false);
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
        <div className="">
          <Select
            name="duration"
            value={formData.duration}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, duration: value }))
            }
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue placeholder="select expiry method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes</SelectItem>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="360">6 hours</SelectItem>
              <SelectItem value="720">12 hours</SelectItem>
              <SelectItem value="1440">24 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>
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

export default TextSharingForm;
