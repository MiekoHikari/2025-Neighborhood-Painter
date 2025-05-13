import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import type { S3Grants } from "@prisma/client";

import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY,
		secretAccessKey: env.AWS_ACCESS_SECRET,
	},
	region: env.AWS_BUCKET_REGION,
});

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

			const url = await getSignedUrl(s3, command, {
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
				},
			});

			const expired = existingGrant?.expired_at
				? new Date(existingGrant.expired_at) < new Date()
				: false;

			if (existingGrant && !expired) {
				return existingGrant;
			}

			// If not, generate a new presigned URL
			const command = new GetObjectCommand({
				Bucket: env.AWS_BUCKET_NAME,
				Key: input.objectKey,
			});

			const url = await getSignedUrl(s3, command, {
				expiresIn: 3600,
			});

			const slug = input.objectKey.split("/")[0];
			if (!slug) {
				throw new Error("Invalid object key");
			}

			const grant = {
				team_id: slug,
				key: input.objectKey,
				url,
				expired_at: new Date(Date.now() + 3600 * 1000),
			};

			let s3grant: S3Grants | null = null;

			// Store the new presigned URL in the database
			if (existingGrant) {
				s3grant = await ctx.db.s3Grants.update({
					where: {
						id: existingGrant.id,
					},
					data: grant,
				});
			} else {
				s3grant = await ctx.db.s3Grants.create({
					data: grant,
				});
			}

			return s3grant;
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

			const url = await getSignedUrl(s3, command, {
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
