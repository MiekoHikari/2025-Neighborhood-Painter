import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";

export const teamRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				slug: z.string(),
				icon: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { name, slug, icon } = input;

			ctx.db.team.create({
				data: {
					name,
					uniqueId: slug,
					icon,
					owner_user_id: ctx.session.user.id,
				},
			});

			ctx.db.userTeam.create({
				data: {
					user_id: ctx.session.user.id,
					team_id: slug,
					role: "owner",
				},
			});
		}),
	read: protectedProcedure
		.input(z.object({ slug: z.string() }))
		.query(async ({ ctx, input }) => {
			const { slug } = input;

			const team = await ctx.db.team.findFirst({
				where: {
					uniqueId: slug,
				},
			});

			if (!team) {
				throw new Error("Team not found");
			}

			return team;
		}),
	update: protectedProcedure
		.input(
			z.object({
				slug: z.string(),
				name: z.string(),
				icon: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { slug, name, icon } = input;

			const team = await ctx.db.team.findFirst({
				where: {
					uniqueId: slug,
				},
			});

			if (!team) {
				throw new Error("Team not found");
			}

			await ctx.db.team.update({
				where: {
					id: team.id,
				},
				data: {
					name,
					icon,
				},
			});
		}),
	delete: protectedProcedure
		.input(z.object({ slug: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const { slug } = input;

			const team = await ctx.db.team.findFirst({
				where: {
					uniqueId: slug,
				},
			});

			if (!team) {
				throw new Error("Team not found");
			}

			await ctx.db.team.delete({
				where: {
					id: team.id,
				},
			});
		}),
});
