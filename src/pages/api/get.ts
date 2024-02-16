// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/firebase";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { destination: string }>
) {
  const linkRef = db.collection("links").doc(req.body.key);
  const link = (await linkRef.get()).data();

  // check if link exist
  if (!link) {
    return res.status(404).json({ message: "Link not found" });
  }

  const now = new Date();
  const expiredAt = new Date(link.expiredAt);

  // link expired
  if (now > expiredAt) {
    await linkRef.delete();
    return res.status(400).json({ message: "Link expired" });
  }

  // TODO add analytics

  res.status(200).json({ destination: link.destination });
}
