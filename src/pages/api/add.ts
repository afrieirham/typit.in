// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/firebase";
import type { NextApiRequest, NextApiResponse } from "next";
import { generate } from "random-words";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { key: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "method not allowed" });
  }

  const { destination, minutes } = req.body;

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

  await db
    .collection("links")
    .doc(key)
    .set({
      destination,
      expiredAt: new Date(now.getTime() + (minutes ?? 5) * 60000).toISOString(),
    });

  res.status(200).json({ key });
}
