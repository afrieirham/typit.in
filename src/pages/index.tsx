import { SelectGroup } from "@radix-ui/react-select";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";
import useSWR from "swr";

import SEOHead from "@/components/molecule/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pulse } from "@/components/ui/pulse";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useHostname } from "@/hooks/useHostname";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const { data: analytics, isLoading } = useSWR("/api/analytics", fetcher);
  const router = useRouter();
  const host = useHostname();
  const { toast } = useToast();

  const [key, setKey] = useState("");
  const [limit, setLimit] = useState("5-min");
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/add", { destination, limit });
      setKey(data.key);
    } catch (error) {
      toast({
        title: "url cannot be empty",
        variant: "destructive",
      });
    }
    setLoading(false);
    setDestination("");
  };

  useEffect(() => {
    if (router.query.message) {
      toast({ title: String(router.query.message) });
    }
  }, [router]);

  return (
    <main className="mx-auto flex h-[100vh] max-w-xs flex-col items-center justify-center">
      <SEOHead
        title="typit.in - catchiest temporary url shortener"
        description="typit.in - catchiest temporary url shortener"
        path="/"
        ogPath="/og.png"
      />

      <h1 className="text-3xl font-bold">typit.in</h1>
      <p className="mt-1">catchiest temporary url shortener</p>
      <div
        role="tablist"
        aria-orientation="horizontal"
        className="mt-4 h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground grid w-full grid-cols-2"
      >
        <button
          type="button"
          onClick={() => router.push("/")}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm"
        >
          Link
        </button>
        <button
          type="button"
          onClick={() => router.push("/files")}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 "
        >
          File
        </button>
      </div>
      <form onSubmit={onSubmit} className="mt-2 flex w-full flex-col space-y-2">
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
              <SelectLabel>by clicks</SelectLabel>
              <SelectItem value="1-click">1 click</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          generate
        </Button>
      </form>
      <div
        className="text-sm text-center mt-4"
        style={{ visibility: isLoading ? "hidden" : "visible" }}
      >
        <p className="flex items-center space-x-1">
          <Pulse active={Boolean(analytics?.active)} />
          <span>
            <b>{analytics?.active ?? 0}</b> active links.
          </span>
        </p>
        <p>
          <b>{analytics?.created ?? 0}</b> links created.
        </p>
      </div>
      <Button
        asChild
        variant="link"
        style={{ visibility: key ? "visible" : "hidden" }}
      >
        <a href={`${host}/${key}`} className="mt-6 text-xl">
          {host.replace("https://", "")}/{key}
        </a>
      </Button>
    </main>
  );
}
