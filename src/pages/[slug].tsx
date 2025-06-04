import "@cyntler/react-doc-viewer/dist/index.css";

import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
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
    <div className="">
      <DocViewer
        className="max-h-[95dvh] overflow-scroll -mt-0"
        documents={[{ uri: `/api/proxy?url=${encodeURIComponent(link)}` }]}
        config={{
          header: {
            disableFileName: true,
            disableHeader: true,
          },
          pdfVerticalScrollByDefault: true,
        }}
        pluginRenderers={DocViewerRenderers}
      />
      <div className="min-h-[5dvh] fixed w-full bottom-0 z-10 bg-black flex items-center justify-center text-white px-4">
        <Link href="/" className="">
          <span className="text-xs">
            shared via <b className="hover:underline">typit.in</b>
          </span>
        </Link>
      </div>
    </div>
  );
}

export default RedirectPage;
