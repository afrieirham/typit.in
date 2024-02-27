// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/firebase";
import type { NextApiRequest, NextApiResponse } from "next";
import { generate } from "random-words";

type TimeLimit =
  | "5-min"
  | "30-min"
  | "60-min"
  | "360-min"
  | "720-min"
  | "1440-min";

type ClickLimit =
  | "1-click"
  | "5-clicks"
  | "10-clicks"
  | "50-clicks"
  | "100-clicks";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    destination: string;
    limit: TimeLimit | ClickLimit;
  };
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<{ message: string } | { key: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "method not allowed" });
  }

  const { destination, limit } = req.body;

  if (!destination || destination === "") {
    return res.status(400).json({ message: "url required" });
  }

  const now = new Date();
  let key = "";

  while (true) {
    key = String(
      generate({
        minLength: 3,
        maxLength: 10,
      })
    );

    const currentKey = (await db.collection("links").doc(key).get()).data();
    if (!currentKey) {
      break;
    }
  }

  const limitValue = Number(limit.split("-")[0]);
  if (limit.includes("min")) {
    await db
      .collection("links")
      .doc(key)
      .set({
        destination,
        clicks: "",
        expiredAt: new Date(
          now.getTime() + (limitValue ?? 5) * 60000
        ).toISOString(),
      });
  } else {
    await db.collection("links").doc(key).set({
      destination,
      clicks: limitValue,
      expiredAt: "",
    });
  }

  // increment analytics
  const createdRef = await db.collection("analytics").doc("created").get();
  const created = createdRef.data();
  await db
    .collection("analytics")
    .doc("created")
    .set({ value: (created?.value ?? 0) + 1 });

  res.status(200).json({ key });
}
