import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Home() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLink("qopy.cc/hello");
      setLoading(false);
    }, 1000);
  };

  return (
    <main className="mx-auto flex h-[100vh] max-w-xs flex-col items-center justify-center">
      <h1 className="text-3xl">qopy.cc</h1>
      <p className="mt-1 text-sm">Catchy URL shortener.</p>

      <form onSubmit={onSubmit} className="mt-4 flex w-full flex-col space-y-2">
        <Input type="url" placeholder="https://youtu.be/dQw4w9WgXcQ" />
        <Select defaultValue="60">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 minutes</SelectItem>
            <SelectItem value="30">30 minutes</SelectItem>
            <SelectItem value="60">1 hour</SelectItem>
            <SelectItem value="360">6 hour</SelectItem>
            <SelectItem value="720">12 hour</SelectItem>
            <SelectItem value="1440">24 hour</SelectItem>
          </SelectContent>
        </Select>
        <Button disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate
        </Button>
      </form>
      <Button
        asChild
        variant="link"
        style={{ visibility: link ? "visible" : "hidden" }}
      >
        <a href={`https://${link}`} className="mt-6 text-xl">
          {link}
        </a>
      </Button>
    </main>
  );
}
