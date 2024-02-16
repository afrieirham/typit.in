// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/firebase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<any>
) {
  // get active links
  const linkRef = db.collection("links");
  const link = await linkRef.get();

  // get total links
  const createdRef = await db.collection("analytics").doc("created").get();
  const created = createdRef.data();

  res.status(200).json({ active: link.size, created: created?.value ?? 0 });
}
