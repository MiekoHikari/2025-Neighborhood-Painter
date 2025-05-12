import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";

const s3Router = createTRPCRouter({
	fetchPresignedUrl: protectedProcedure
		.input(
			z.object({
				file: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const { file } = input;

			// Generate a presigned URL for uploading to S3
			const command = new PutObjectCommand({
				Bucket: env.AWS_BUCKET_NAME,
				Key: file,
			});

			const url = await getSignedUrl(ctx.s3Client, command, {
				expiresIn: 3600,
			});
			return url;
		}),
});

export default s3Router;
