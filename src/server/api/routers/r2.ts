import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const r2Client = new S3Client({
  region: "auto", // R2 doesn't use AWS regions in the same way, "auto" often works.
  endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
  // Setting forcePathStyle to true is often recommended for S3-compatible services
  // that are not AWS S3 itself, like R2.
  forcePathStyle: true,
});

export const r2Router = createTRPCRouter({
  getSignedUploadUrl: publicProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileType: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const fileExtension = input.fileName.split(".").pop();
        const safeFileName = `${crypto.randomUUID()}.${fileExtension}`;
        const r2Key = `uploads/${safeFileName}`;

        const command = new PutObjectCommand({
          Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
          Key: r2Key,
          ContentType: input.fileType,
        });

        const signedUrl = await getSignedUrl(r2Client, command, {
          expiresIn: 3600,
        });

        const publicFileUrl = `${env.CLOUDFLARE_R2_PUBLIC_DOMAIN}/${r2Key}`;

        return {
          signedUrl,
          fileName: safeFileName,
          fileType: input.fileType,
          publicFileUrl,
        };
      } catch (error) {
        console.error("Error generating signed URL for R2:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate signed upload URL for Cloudflare R2.",
          cause: error,
        });
      }
    }),
});
