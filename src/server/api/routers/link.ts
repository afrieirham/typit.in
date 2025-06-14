import { z } from "zod";
import { generate } from "random-words";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const linkRouter = createTRPCRouter({
  createShortLink: publicProcedure
    .input(
      z.object({
        limit: z.string(),
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
        if (!link) {
          break;
        }
      }

      // limit type
      const [type, value] = input.limit.split("-");

      const expiredIn = type === "visit" ? Number(value) : null;
      const now = new Date();
      const expiredAt =
        type === "duration"
          ? new Date(now.getTime() + Number(value) * 60000).toISOString()
          : null;

      const link = await ctx.db.link.create({
        data: {
          code: code,
          expiredAt,
          expiredIn,
          destinationUrl: input.destinationUrl,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "url" } });

      return link.code;
    }),

  createNotesLink: publicProcedure
    .input(
      z.object({
        limit: z.string(),
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
        if (!link) {
          break;
        }
      }

      // limit type
      const [type, value] = input.limit.split("-");

      const expiredIn = type === "visit" ? Number(value) : null;
      const now = new Date();
      const expiredAt =
        type === "duration"
          ? new Date(now.getTime() + Number(value) * 60000).toISOString()
          : null;

      const link = await ctx.db.link.create({
        data: {
          code: code,
          expiredAt,
          expiredIn,
          content: input.content,
        },
      });

      await ctx.db.createdLinkLog.create({ data: { type: "note" } });

      return link.code;
    }),
});
