"use client";

import type React from "react";
import { useState } from "react";

import { useAutoAnimate } from "@formkit/auto-animate/react";

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";

import LinkDisplay from "./link-display";

const INITIAL_VALUE = {
  content: "",
  limit: "duration-5",
};

function TextSharingForm() {
  const [parent] = useAutoAnimate();

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
    create.mutate({ limit: formData.limit, content: formData.content });
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
            name="limit"
            value={formData.limit}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, limit: value }))
            }
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
        <Button loading={loading} type="submit" className="h-10 w-full">
          Generate
        </Button>
      </form>
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

export default TextSharingForm;
