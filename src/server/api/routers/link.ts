import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
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
        fileName: link?.fileName,
        content: link?.content,
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
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "file" } });

      return code;
    }),
});
