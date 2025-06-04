import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

const ALLOWED_ORIGINS = ["https://typit.in", "http://localhost:3000"];

// /pages/api/proxy.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const origin = req.headers.origin || req.headers.referer || "";
  const isAllowed = ALLOWED_ORIGINS.some((allowed) =>
    origin.startsWith(allowed)
  );

  if (!isAllowed) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { url } = req.query;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing or invalid url param" });
  }

  try {
    const response = await axios.get(url, {
      responseType: "stream",
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    response.data.pipe(res);
  } catch (error: any) {
    console.error("Proxy error:", error.message);
    res.status(500).json({ error: "Failed to fetch file" });
  }
}
