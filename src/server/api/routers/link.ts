import { TRPCError } from "@trpc/server";
import { generate } from "random-words";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

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
        fileUrl: link?.fileUrl,
        content: link?.content,
      };
    }),
  getLinksAnalytics: publicProcedure.query(async ({ ctx }) => {
    const url = await ctx.db.createdLinkLog.count({ where: { type: "url" } });
    const file = await ctx.db.createdLinkLog.count({ where: { type: "file" } });
    const note = await ctx.db.createdLinkLog.count({ where: { type: "note" } });

    const active = await ctx.db.link.count();

    return { url: url + 7841, file: file + 246, note, active };
  }),
  createShortLink: publicProcedure
    .input(
      z.object({
        duration: z.number(),
        destinationUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // create unique code
      let code = "";
      while (true) {
        code = generate({
          minLength: 3,
          maxLength: 10,
          exactly: 1,
          join: "",
        });

        const link = await ctx.db.link.findFirst({ where: { code } });
        if (!link && code !== "notes" && code !== "files" && code !== "links") {
          break;
        }
      }

      const now = new Date();
      const expiredAt = new Date(
        now.getTime() + input.duration * 60000,
      ).toISOString();

      const link = await ctx.db.link.create({
        data: {
          code: code,
          expiredAt,
          destinationUrl: input.destinationUrl,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "url" } });

      return link.code;
    }),
  createNotesLink: publicProcedure
    .input(
      z.object({
        duration: z.number(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // create unique code
      let code = "";
      while (true) {
        code = generate({
          minLength: 3,
          maxLength: 10,
          exactly: 1,
          join: "",
        });

        const link = await ctx.db.link.findFirst({ where: { code } });
        if (!link && code !== "notes" && code !== "files" && code !== "links") {
          break;
        }
      }

      const now = new Date();
      const expiredAt = new Date(
        now.getTime() + input.duration * 60000,
      ).toISOString();

      const link = await ctx.db.link.create({
        data: {
          code: code,
          expiredAt,
          content: input.content,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "note" } });

      return link.code;
    }),
  createFileLink: publicProcedure
    .input(
      z.object({
        duration: z.number(),
        fileUrl: z.string().url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // create unique code
      let code = "";
      while (true) {
        code = generate({
          minLength: 3,
          maxLength: 10,
          exactly: 1,
          join: "",
        });

        const link = await ctx.db.link.findFirst({ where: { code } });
        if (!link && code !== "notes" && code !== "files" && code !== "links") {
          break;
        }
      }

      const now = new Date();
      const expiredAt = new Date(
        now.getTime() + input.duration * 60000,
      ).toISOString();

      const link = await ctx.db.link.create({
        data: {
          code: code,
          expiredAt,
          fileUrl: input.fileUrl,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "file" } });

      return link.code;
    }),
});
