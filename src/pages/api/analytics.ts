// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/firebase-admin";
import { bucket } from "@/lib/firebase-admin";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  _: NextApiRequest,
  res: NextApiResponse<any>
) {
  // get active links
  const linkRef = db.collection("links");
  const links = await linkRef.get();

  let expiredLinkCount = 0;

  // delete expired links
  const now = new Date();
  await Promise.all(
    links.docs.map(async (doc) => {
      const link = doc.data();
      const expiredAt = new Date(link.expiredAt);

      // delete if expired by time
      if (now > expiredAt) {
        expiredLinkCount++;

        if (link.filePath) {
          const fileRef = bucket.file(link.filePath);
          const [exist] = await fileRef.exists();
          if (exist) await fileRef.delete();
        }
        return db.collection("links").doc(doc.id).delete();
      }
    })
  );

  // get total links
  const createdRef = await db.collection("analytics").doc("created").get();
  const created = createdRef.data();

  res.status(200).json({
    active: links.size - expiredLinkCount,
    created: created?.value ?? 0,
  });
}
