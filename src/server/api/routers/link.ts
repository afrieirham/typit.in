import { z } from "zod";
import { generate } from "random-words";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const linkRouter = createTRPCRouter({
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
