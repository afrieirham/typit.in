"use client";
import { Loader2 } from "lucide-react";
// import Link from "next/link";
import { useState } from "react";

// import { LatestPost } from "@/app/_components/post";
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
import { useHostName } from "@/hooks/useHostName";
// import { api, HydrateClient } from "@/trpc/server";

export default function Home() {
  // const hello = await api.post.hello({ text: "from tRPC" });

  // void api.post.getLatest.prefetch();

  const host = useHostName();

  const [key, setKey] = useState("");
  const [limit, setLimit] = useState("5-min");
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");

  return (
    // <HydrateClient>
    <main className="mx-auto flex h-[100vh] max-w-xs flex-col items-center justify-center">
      <h1 className="text-3xl font-bold">typit.in</h1>
      <p className="mt-1">catchiest temporary url shortener</p>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="bg-muted text-muted-foreground mt-4 grid h-10 w-full grid-cols-2 items-center justify-center rounded-md p-1"
      >
        <button
          type="button"
          // onClick={() => router.push("/")}
          className="ring-offset-background focus-visible:ring-ring bg-background text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap shadow-sm transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          Link
        </button>
        <button
          type="button"
          // onClick={() => router.push("/files")}
          className="ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
        >
          File
        </button>
      </div>
      <form
        // onSubmit={onSubmit}
        className="mt-2 flex w-full flex-col space-y-2"
      >
        <Input
          required
          type="url"
          name="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="https://youtu.be/dQw4w9WgXcQ"
        />
        <Select value={limit} onValueChange={(value) => setLimit(value)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>by duration</SelectLabel>
              <SelectItem value="5-min">5 minutes</SelectItem>
              <SelectItem value="30-min">30 minutes</SelectItem>
              <SelectItem value="60-min">1 hour</SelectItem>
              <SelectItem value="360-min">6 hours</SelectItem>
              <SelectItem value="720-min">12 hours</SelectItem>
              <SelectItem value="1440-min">24 hours</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          generate
        </Button>
      </form>
      <Button variant="link" asChild className="mt-6">
        <a href="https://donate.stripe.com/eVa3dd2wk9CQaXK3ce" target="_blank">
          buy me a coffee ☕️
        </a>
      </Button>
      {/* <div
          className="mt-4 text-center text-sm"
          style={{ visibility: isLoading ? "hidden" : "visible" }}
        >
          <p className="flex items-center space-x-1">
            <Pulse active={Boolean(analytics?.active)} />
            <span>
              <b>{analytics?.active ?? 0}</b> active links.
            </span>
          </p>
          <p>
            <b>{analytics?.linksCreated ?? 0}</b> links created.
          </p>
          <p>
            <b>{analytics?.filesTransferred ?? 0}</b> files transferred.
          </p>
        </div> */}
      <Button
        asChild
        variant="link"
        style={{ visibility: key ? "visible" : "hidden" }}
        className="mt-6 text-xl"
      >
        <a href={`${host}/${key}`}>
          {host.replace("https://", "")}/{key}
        </a>
      </Button>
    </main>
    // </HydrateClient>
  );
}
