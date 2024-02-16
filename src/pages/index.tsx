import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useHostname } from "@/hooks/useHostname";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { FormEvent, useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const host = useHostname();
  const { toast } = useToast();

  const [key, setKey] = useState("");
  const [minutes, setMinutes] = useState("60");
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axios.post("/api/add", { destination, minutes });
      setKey(data.key);
    } catch (error) {
      toast({
        title: "URL cannot be empty",
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
      <h1 className="text-3xl">TypIt.In</h1>
      <p className="mt-1 text-sm">Catchy URL shortener.</p>

      <form onSubmit={onSubmit} className="mt-4 flex w-full flex-col space-y-2">
        <Input
          required
          type="url"
          name="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder="https://youtu.be/dQw4w9WgXcQ"
        />
        <Select value={minutes} onValueChange={(value) => setMinutes(value)}>
          <SelectTrigger>
            <SelectValue />
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
        <Button disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate
        </Button>
      </form>
      <Button
        asChild
        variant="link"
        style={{ visibility: key ? "visible" : "hidden" }}
      >
        <a href={`${host}/${key}`} className="mt-6 text-xl">
          {host}/{key}
        </a>
      </Button>
    </main>
  );
}
