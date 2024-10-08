// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";
import { generate } from "random-words";

type TimeLimit =
  | "5-min"
  | "30-min"
  | "60-min"
  | "360-min"
  | "720-min"
  | "1440-min";

interface ExtendedNextApiRequest extends NextApiRequest {
  body: {
    destination: string;
    limit: TimeLimit;
    filePath: string;
  };
}

export default async function handler(
  req: ExtendedNextApiRequest,
  res: NextApiResponse<{ message: string } | { key: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "method not allowed" });
  }

  const { destination, limit, filePath = "" } = req.body;

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
  await db
    .collection("links")
    .doc(key)
    .set({
      filePath,
      destination,
      expiredAt: new Date(
        now.getTime() + (limitValue ?? 5) * 60000
      ).toISOString(),
    });

  // increment analytics
  const counterRef = await db.collection("analytics").doc("counter").get();
  const counter = counterRef.data();
  await db
    .collection("analytics")
    .doc("counter")
    .set({
      linksCreated: (counter?.linksCreated ?? 0) + 1,
      filesTransferred: filePath
        ? (counter?.filesTransferred ?? 0) + 1
        : counter?.filesTransferred ?? 0,
    });

  res.status(200).json({ key });
}
