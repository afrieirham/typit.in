"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function TextSharingForm() {
  const [formData, setFormData] = useState({
    text: "",
    duration: "5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Contact form submitted: " + JSON.stringify(formData));
    setFormData({ text: "", duration: "" });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="">
        <Textarea
          id="text"
          name="text"
          value={formData.text}
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
            <SelectValue placeholder="Select a form" />
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
      <Button type="submit" className="h-10 w-full">
        Generate
      </Button>
    </form>
  );
}

export default TextSharingForm;
