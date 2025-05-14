import EventEmitter from "node:events";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { observable } from "@trpc/server/observable";
import type { Team } from "@prisma/client";

export const teamEvents = new EventEmitter();

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

			const team = await ctx.db.team.create({
				data: {
					name,
					uniqueId: slug,
					icon,
					owner_user_id: ctx.session.user.id,
				},
			});

			const connection = await ctx.db.userTeam.create({
				data: {
					user_id: ctx.session.user.id,
					team_id: team.uniqueId,
					role: "owner",
				},
			});

			teamEvents.emit("update", team);

			return connection;
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

			const newTeam = await ctx.db.team.update({
				where: {
					id: team.id,
				},
				data: {
					name,
					icon,
				},
			});

			teamEvents.emit("update", newTeam);
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

			teamEvents.emit("update", team);
		}),
	readAll: protectedProcedure.query(async ({ ctx }) => {
		const teams = await ctx.db.userTeam.findMany({
			where: {
				user_id: ctx.session.user.id,
			},
			include: {
				team: true,
			},
		});

		return teams.map((team) => ({
			...team.team,
			role: team.role,
		}));
	}),
	onUpdate: protectedProcedure.subscription(() => {
		return observable<Team>((emit) => {
			teamEvents.on("update", emit.next);

			return () => {
				teamEvents.off("update", emit.next);
			};
		});
	}),
});
