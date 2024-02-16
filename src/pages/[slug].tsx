import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";

function RedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const key = router.query.slug;

    const run = async () => {
      try {
        const { data } = await axios.post("/api/get", { key });
        if (data) {
          void router.push(data.destination);
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

  return null;
}

export default RedirectPage;
