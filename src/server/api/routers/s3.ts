import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";

const s3Router = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				objectKey: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Generate a presigned URL for uploading to S3
			const command = new PutObjectCommand({
				Bucket: env.AWS_BUCKET_NAME,
				Key: input.objectKey,
			});

			const url = await getSignedUrl(ctx.s3Client, command, {
				expiresIn: 3600,
			});

			return url;
		}),
	read: protectedProcedure
		.input(
			z.object({
				objectKey: z.string(),
			}),
		)
		.query(async ({ ctx, input }) => {
			// Check if we've already generated a presigned URL for this object
			const existingGrant = await ctx.db.s3Grants.findFirst({
				where: {
					key: input.objectKey,
					expired_at: {
						gte: new Date(),
					},
				},
			});

			if (existingGrant) {
				return existingGrant;
			}

			// If not, generate a new presigned URL
			const command = new GetObjectCommand({
				Bucket: env.AWS_BUCKET_NAME,
				Key: input.objectKey,
			});

			const url = await getSignedUrl(ctx.s3Client, command, {
				expiresIn: 3600,
			});

			const slug = input.objectKey.split("/")[0];
			if (!slug) {
				throw new Error("Invalid object key");
			}

			// Store the new presigned URL in the database
			const grant = await ctx.db.s3Grants.create({
				data: {
					team_id: slug,
					key: input.objectKey,
					url,
					expired_at: new Date(Date.now() + 3600 * 1000),
				},
			});

			return grant;
		}),
	update: protectedProcedure
		.input(
			z.object({
				slug: z.string(),
				objectKey: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Delete existing grants
			await ctx.db.s3Grants.deleteMany({
				where: {
					team_id: input.slug,
					key: {
						startsWith: input.objectKey.split(".")[0],
					},
				},
			});

			// Generate a new presigned URL
			const command = new PutObjectCommand({
				Bucket: env.AWS_BUCKET_NAME,
				Key: input.objectKey,
			});

			const url = await getSignedUrl(ctx.s3Client, command, {
				expiresIn: 3600,
			});

			// Store the new presigned URL in the database
			const grant = await ctx.db.s3Grants.create({
				data: {
					team_id: input.slug,
					key: input.objectKey,
					url,
					expired_at: new Date(Date.now() + 3600 * 1000),
				},
			});

			return grant;
		}),
	delete: protectedProcedure
		.input(
			z.object({
				slug: z.string(),
				objectKey: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Delete the presigned URL from the database
			await ctx.db.s3Grants.deleteMany({
				where: {
					team_id: input.slug,
					key: input.objectKey,
				},
			});

			return true;
		}),
});

export default s3Router;
