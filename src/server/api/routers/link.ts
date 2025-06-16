import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import { generate } from "random-words";
import { z } from "zod";

import { env } from "@/env";
import { r2Client } from "@/server/api/routers/r2";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { PrismaClient } from "@prisma/client";

const getUniqueCode = async (db: PrismaClient) => {
  let code = "";
  while (true) {
    code = generate({
      minLength: 3,
      maxLength: 10,
      exactly: 1,
      join: "",
    });

    const link = await db.link.findFirst({ where: { code } });
    if (!link && code !== "notes" && code !== "files" && code !== "links") {
      break;
    }
  }

  return code;
};

const getExpiredAtDateTime = (duration: number) => {
  const now = new Date();
  const expiredAt = new Date(now.getTime() + duration * 60000).toISOString();

  return expiredAt;
};

const deleteExpiredFiles = async (db: PrismaClient, now: Date) => {
  const expiredFiles = await db.link.findMany({
    select: { fileName: true },
    where: {
      expiredAt: { lt: now },
      fileName: { not: null },
    },
  });

  if (expiredFiles.length > 0) {
    const objectsToDelete = expiredFiles.map(({ fileName }) => ({
      Key: fileName ? `uploads/${fileName}` : "",
    }));

    const command = new DeleteObjectsCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Delete: {
        Objects: objectsToDelete,
        Quiet: false,
      },
    });

    const response = await r2Client.send(command);
    if (response.Errors && response.Errors.length > 0) {
      console.error("Errors during multi-object delete:", response.Errors);
    }
  }
};

export const linkRouter = createTRPCRouter({
  getLinkInfo: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.link.findFirst({ where: { code: input.code } });

      if (!link) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
      }

      if (new Date().getTime() - Number(link?.expiredAt?.getTime()) > 0) {
        await ctx.db.link.delete({ where: { code: input.code } });
        throw new TRPCError({ code: "BAD_REQUEST", message: "Link expired" });
      }

      return {
        destinationUrl: link?.destinationUrl,
        fileName: link?.fileName,
        content: link?.content,
      };
    }),
  getLinksAnalytics: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const url = await ctx.db.createdLinkLog.count({ where: { type: "url" } });
    const file = await ctx.db.createdLinkLog.count({ where: { type: "file" } });
    const note = await ctx.db.createdLinkLog.count({ where: { type: "note" } });
    const active = await ctx.db.link.count();

    await deleteExpiredFiles(ctx.db, now);
    await ctx.db.link.deleteMany({ where: { expiredAt: { lt: now } } });

    return { url: url + 7889, file: file + 252, note, active };
  }),
  createShortLink: publicProcedure
    .input(
      z.object({
        duration: z.number(),
        destinationUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const code = await getUniqueCode(ctx.db);
      const expiredAt = getExpiredAtDateTime(input.duration);

      await ctx.db.link.create({
        data: {
          code,
          expiredAt,
          destinationUrl: input.destinationUrl,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "url" } });

      return code;
    }),
  createNotesLink: publicProcedure
    .input(
      z.object({
        duration: z.number(),
        content: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const code = await getUniqueCode(ctx.db);
      const expiredAt = getExpiredAtDateTime(input.duration);

      await ctx.db.link.create({
        data: {
          code,
          expiredAt,
          content: input.content,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "note" } });

      return code;
    }),
  createFileLink: publicProcedure
    .input(
      z.object({
        duration: z.number(),
        fileName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const code = await getUniqueCode(ctx.db);
      const expiredAt = getExpiredAtDateTime(input.duration);

      await ctx.db.link.create({
        data: {
          code,
          expiredAt,
          fileName: input.fileName,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "file" } });

      return code;
    }),
});
