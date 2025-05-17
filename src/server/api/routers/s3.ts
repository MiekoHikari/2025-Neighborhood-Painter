import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

import { deletePresignedUrl, getOrCreatePresignedUrl, getPresignedUrlsForSlugs, getUploadUrl, updatePresignedUrl } from "~/server/lib/s3";

const s3Router = createTRPCRouter({
	CreateOrUpdate: protectedProcedure
		.input(
			z.object({
				objectKey: z.string(),
				expiresIn: z.number(),
			}),
		)
		.mutation(async ({ input }) => {
			return await getUploadUrl(
				input.objectKey,
				input.expiresIn,
			);
		}),
	Read: protectedProcedure
		.input(
			z.object({
				objectKey: z.string(),
				expiresIn: z.number().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await getOrCreatePresignedUrl(ctx.db, input.objectKey, input.expiresIn);
		}),
	ReadMany: protectedProcedure
		.input(
			z.object({
				slugs: z.string().array(),
			}),
		)
		.query(async ({ ctx, input }) => {
			return await getPresignedUrlsForSlugs(ctx.db, input.slugs);
		}),
	Update: protectedProcedure
		.input(
			z.object({
				slug: z.string(),
				objectKey: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await updatePresignedUrl(ctx.db, input.slug, input.objectKey);
		}),
	Delete: protectedProcedure
		.input(
			z.object({
				slug: z.string(),
				objectKey: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			return await deletePresignedUrl(ctx.db, input.slug, input.objectKey);
		}),
});

export default s3Router;
