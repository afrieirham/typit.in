// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { db } from "@/lib/firebase-admin";
import { storage } from "@/lib/firebase-web";
import { deleteObject, ref } from "firebase/storage";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ message: string } | { destination: string }>
) {
  const linkRef = db.collection("links").doc(req.body.key);
  const link = (await linkRef.get()).data();

  // check if link exist
  if (!link) {
    return res.status(404).json({ message: "link not found" });
  }

  const deleteLink = async () => {
    if (link.filePath) {
      const fileRef = ref(storage, link.filePath);
      if (fileRef) await deleteObject(fileRef);
    }
    await linkRef.delete();
    return res.status(400).json({ message: "link expired" });
  };

  if (link.expiredAt) {
    const now = new Date();
    const expiredAt = new Date(link.expiredAt);

    // link expired
    if (now > expiredAt || link.clicks === 0) {
      await deleteLink();
    }
  }

  // decrement clicks
  if (link.clicks > 0) {
    await linkRef.update({ clicks: link.clicks - 1 });
  } else {
    await deleteLink();
  }

  res.status(200).json({ destination: link.destination });
}
