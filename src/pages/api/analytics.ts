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

  // delete all photos that is more than 24-hours
  const [files] = await bucket.getFiles();
  const twentyFourHoursInMillis = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  for await (const file of files) {
    const [{ timeCreated }] = await file.getMetadata();

    if (!timeCreated) break;
    const createdAt = new Date(timeCreated);

    const moreThan24Hours =
      now.getTime() - createdAt.getTime() > twentyFourHoursInMillis;

    if (moreThan24Hours) {
      file.delete();
    }
  }

  // get total links
  const counterRef = await db.collection("analytics").doc("counter").get();
  const counter = counterRef.data();

  res.status(200).json({
    active: links.size - expiredLinkCount,
    linksCreated: counter?.linksCreated ?? 0,
    filesTransferred: counter?.filesTransferred ?? 0,
  });
}
