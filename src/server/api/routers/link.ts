import { z } from "zod";
import { generate } from "random-words";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const linkRouter = createTRPCRouter({
  create: publicProcedure
    .input(
      z.object({
        limit: z.string(),
        fileUrl: z.string().url().optional(),
        destinationUrl: z.string().url().optional(),
        content: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.fileUrl && !input.destinationUrl && !input.content) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Invalid request, must at least have a file or destination url or content.",
        });
      }

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
          content: input.content,
        },
      });

      return link.code;
    }),
});
