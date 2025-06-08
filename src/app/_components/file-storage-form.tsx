"use client";

import type React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function FileStorageForm() {
  const [formData, setFormData] = useState({
    file: "",
    duration: "5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Contact form submitted: " + JSON.stringify(formData));
    setFormData({ file: "", duration: "" });
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
        <Input
          id="file"
          name="file"
          value={formData.file}
          onChange={handleChange}
          className="text-sm"
          type="file"
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

export default FileStorageForm;
