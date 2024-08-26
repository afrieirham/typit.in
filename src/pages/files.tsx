import { SelectGroup } from "@radix-ui/react-select";
import axios from "axios";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
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
import { storage } from "@/lib/firebase-web";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function Home() {
  const inputFile = useRef<HTMLInputElement>(null);

  const { data: analytics, isLoading } = useSWR("/api/analytics", fetcher);
  const router = useRouter();
  const host = useHostname();
  const { toast } = useToast();

  const [key, setKey] = useState("");
  const [limit, setLimit] = useState("5-min");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>();

  const onUploadFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (!files || files.length < 0) {
      return;
    }
    setFile(files[0]);
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!file) {
      toast({
        title: "file cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // upload file
    const filePath = `send/${file.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file);

    // shorten url
    const url = await getDownloadURL(ref(storage, filePath));
    const { data } = await axios.post("/api/add", {
      destination: url,
      limit,
      filePath,
    });
    setKey(data.key);

    // reset
    setLoading(false);
    setFile(null);
    if (inputFile.current) {
      inputFile.current.value = "";
    }
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
          role="tab"
          onClick={() => router.push("/")}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 "
        >
          Link
        </button>
        <button
          type="button"
          role="tab"
          onClick={() => router.push("/files")}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-background text-foreground shadow-sm"
        >
          File
        </button>
      </div>
      <form onSubmit={onSubmit} className="mt-2 flex w-full flex-col space-y-2">
        <Input required type="file" onChange={onUploadFile} ref={inputFile} />
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
      <Button variant="link" asChild className="mt-6">
        <a href="https://donate.stripe.com/eVa3dd2wk9CQaXK3ce" target="_blank">
          buy me a coffee ☕️
        </a>
      </Button>
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
        className="mt-6 text-xl"
      >
        <a href={`${host}/${key}`}>
          {host.replace("https://", "")}/{key}
        </a>
      </Button>
    </main>
  );
}
