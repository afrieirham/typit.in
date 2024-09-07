import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function RedirectPage() {
  const router = useRouter();
  const [link, setLink] = useState("");

  useEffect(() => {
    const key = router.query.slug;

    const run = async () => {
      try {
        const { data } = await axios.post("/api/get", { key });
        if (!data.isFile) {
          void router.push(data.destination);
        } else {
          setLink(data.destination);
        }
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const error = e?.response?.data;
          void router.push(`/?message=${error.message}`);
        } else {
          console.error(e);
        }
      }
    };

    if (key) run();
  }, [router]);

  if (!link) return null;

  return (
    <div className="min-h-screen">
      <iframe
        src={
          "https://docs.google.com/viewer?embedded=true&url=" +
          encodeURIComponent(link)
        }
        className="min-h-[95dvh] w-full border-none"
      />

      <Link
        href="/"
        className="min-h-[5dvh] flex items-center justify-center bg-black text-white"
      >
        <span className="text-xs">
          shared via <b className="hover:underline">typit.in</b>
        </span>
      </Link>
    </div>
  );
}

export default RedirectPage;
