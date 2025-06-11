"use client";

import type React from "react";
import { useState } from "react";

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

export default function UrlShortenerForm() {
  const [formData, setFormData] = useState({
    url: "",
    limit: "duration-5",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Contact form submitted: " + JSON.stringify(formData));
    setFormData({ url: "", limit: "" });
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
      <div className="">
        <Select
          name="limit"
          value={formData.limit}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, limit: value }))
          }
        >
          <SelectTrigger className="h-10 w-full">
            <SelectValue placeholder="Select a form" />
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
      <Button type="submit" className="h-10 w-full">
        Generate
      </Button>
    </form>
  );
}
