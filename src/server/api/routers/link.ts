import { DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import axios from "axios";
import { compare, hash } from "bcrypt";
import { generate } from "random-words";
import { z } from "zod";

import { env } from "@/env";
import { r2Client } from "@/server/api/routers/r2";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { TurnstileAxiosResponse } from "@/types";

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

const deleteExpiredFiles = async () => {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const objectsToDelete: Array<{ Key: string }> = [];
  let continuationToken: string | undefined;

  // List all objects with pagination support
  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Prefix: "uploads/",
      ContinuationToken: continuationToken,
    });

    const listResponse = await r2Client.send(listCommand);

    if (listResponse.Contents) {
      // Filter objects older than 24 hours
      for (const object of listResponse.Contents) {
        if (
          object.Key &&
          object.LastModified &&
          object.LastModified < twentyFourHoursAgo
        ) {
          objectsToDelete.push({ Key: object.Key });
        }
      }
    }

    continuationToken = listResponse.NextContinuationToken;
  } while (continuationToken);

  // Delete objects in batches of 1000 (S3/R2 limit)
  if (objectsToDelete.length > 0) {
    for (let i = 0; i < objectsToDelete.length; i += 1000) {
      const batch = objectsToDelete.slice(i, i + 1000);

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
        Delete: {
          Objects: batch,
          Quiet: false,
        },
      });

      const deleteResponse = await r2Client.send(deleteCommand);
      if (deleteResponse.Errors && deleteResponse.Errors.length > 0) {
        console.error(
          "Errors during multi-object delete:",
          deleteResponse.Errors,
        );
      }
    }
  }
};

const verifyCfToken = async (token: string) => {
  if (!token) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "missing cf token",
    });
  }

  const verificationParams = new URLSearchParams();
  verificationParams.append("secret", env.CLOUDFLARE_TURNSTILE_SECRET_KEY);
  verificationParams.append("response", token);

  const turnstileResponse: TurnstileAxiosResponse = await axios.post(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    verificationParams.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
  );

  if (!turnstileResponse.data.success) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "verification failed",
    });
  }
};

const getHashPassword = async (password?: string) => {
  let hashPassword = null;

  if (password) {
    hashPassword = await hash(password, Number(env.SALT));
  }

  return hashPassword;
};

const getLinkByCode = async (db: PrismaClient, code: string) => {
  const link = await db.link.findFirst({ where: { code } });

  if (!link) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Link not found" });
  }

  return link;
};

export const linkRouter = createTRPCRouter({
  isRequirePassword: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await getLinkByCode(ctx.db, input.code);
      return Boolean(link.password);
    }),
  getLinkInfo: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await getLinkByCode(ctx.db, input.code);

      if (new Date().getTime() - Number(link?.expiredAt?.getTime()) > 0) {
        await ctx.db.link.delete({ where: { code: input.code } });
        throw new TRPCError({ code: "BAD_REQUEST", message: "Link expired" });
      }

      return {
        destinationUrl: link?.destinationUrl,
        content: link?.content,
        file: {
          fileName: link?.fileName,
          originalFileName: link?.originalFileName,
        },
      };
    }),
  getLinkInfoWithPassword: publicProcedure
    .input(z.object({ code: z.string(), password: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await getLinkByCode(ctx.db, input.code);
      const match = await compare(input.password, link.password ?? "");

      if (!match) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Incorrect password",
        });
      }

      if (new Date().getTime() - Number(link?.expiredAt?.getTime()) > 0) {
        await ctx.db.link.delete({ where: { code: input.code } });
        throw new TRPCError({ code: "BAD_REQUEST", message: "Link expired" });
      }

      return {
        destinationUrl: link?.destinationUrl,
        content: link?.content,
        file: {
          fileName: link?.fileName,
          originalFileName: link.originalFileName,
        },
      };
    }),
  getLinksAnalytics: publicProcedure.query(async ({ ctx }) => {
    const now = new Date();
    const url = await ctx.db.createdLinkLog.count({ where: { type: "url" } });
    const file = await ctx.db.createdLinkLog.count({ where: { type: "file" } });
    const note = await ctx.db.createdLinkLog.count({ where: { type: "note" } });
    const active = await ctx.db.link.count();

    await deleteExpiredFiles();
    await ctx.db.link.deleteMany({ where: { expiredAt: { lt: now } } });

    return { url: url + 7889, file: file + 252, note, active };
  }),
  createShortLink: publicProcedure
    .input(
      z.object({
        duration: z.number(),
        destinationUrl: z.string().url(),
        cfToken: z.string(),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyCfToken(input.cfToken);
      const code = await getUniqueCode(ctx.db);
      const expiredAt = getExpiredAtDateTime(input.duration);
      const hashPassword = await getHashPassword(input.password);

      await ctx.db.link.create({
        data: {
          code,
          expiredAt,
          destinationUrl: input.destinationUrl,
          password: hashPassword,
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
        cfToken: z.string(),
        password: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyCfToken(input.cfToken);
      const code = await getUniqueCode(ctx.db);
      const expiredAt = getExpiredAtDateTime(input.duration);
      const hashPassword = await getHashPassword(input.password);

      await ctx.db.link.create({
        data: {
          code,
          expiredAt,
          content: input.content,
          password: hashPassword,
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
        cfToken: z.string(),
        password: z.string().optional(),
        originalFileName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await verifyCfToken(input.cfToken);
      const code = await getUniqueCode(ctx.db);
      const expiredAt = getExpiredAtDateTime(input.duration);
      const hashPassword = await getHashPassword(input.password);

      await ctx.db.link.create({
        data: {
          code,
          expiredAt,
          fileName: input.fileName,
          password: hashPassword,
          originalFileName: input.originalFileName,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "file" } });

      return code;
    }),
});
