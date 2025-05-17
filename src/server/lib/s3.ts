import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { env } from "~/env";
import type { S3Grants } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

export const DEFAULT_EXPIRATION = 7 * 24 * 60 * 60; // 7 days

export const s3Client = new S3Client({
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_ACCESS_SECRET,
    },
    region: env.AWS_BUCKET_REGION,
});

/**
 * Generate a presigned URL for uploading an object to S3
 */
export async function getUploadUrl(objectKey: string, expiresIn: number): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: objectKey,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading an object from S3
 */
export async function getDownloadUrl(objectKey: string, expiresIn = DEFAULT_EXPIRATION): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: objectKey,
    });

    return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get or create a presigned URL, storing it in the database
 */
export async function getOrCreatePresignedUrl(
    db: PrismaClient,
    objectKey: string,
    expiresIn = DEFAULT_EXPIRATION
): Promise<S3Grants> {
    const existingGrant = await db.s3Grants.findFirst({
        where: { key: objectKey },
    });

    if (existingGrant) {
        const expired = validateGrants([existingGrant]).length === 0;
        if (!expired) return existingGrant;
    }

    const url = await getDownloadUrl(objectKey, expiresIn);

    const slug = objectKey.split("/")[0];
    if (!slug) {
        throw new Error("Invalid object key");
    }

    const grant = {
        team_id: slug,
        key: objectKey,
        url,
        expired_at: new Date(Date.now() + expiresIn * 1000),
    };

    if (existingGrant) {
        return db.s3Grants.update({
            where: { id: existingGrant.id },
            data: grant,
        });
    } else {
        return db.s3Grants.create({ data: grant });
    }
}

/**
 * Get presigned URLs for multiple teams/slugs
 */
export async function getPresignedUrlsForSlugs(
    db: PrismaClient,
    slugs: string[]
): Promise<S3Grants[]> {
    // Fetch all presigned URLs for the given slugs
    const grants = await db.s3Grants.findMany({
        where: {
            team_id: { in: slugs },
        },
    });

    // Re-validate the presigned URLs
    const updatedGrants = await Promise.all(
        grants.map(async (grant) => {
            let validGrant = grant;

            if (grant.expired_at && new Date(grant.expired_at) < new Date()) {
                // If the URL is expired, generate a new one
                const url = await getDownloadUrl(grant.key, 3600);

                // Update the database with the new URL
                validGrant = await db.s3Grants.update({
                    where: { id: grant.id },
                    data: {
                        url,
                        expired_at: new Date(Date.now() + 3600 * 1000),
                    },
                });
            }

            return validGrant;
        })
    );

    const slugsNotFound = slugs.filter(
        (slug) => !updatedGrants.some((grant) => grant.team_id === slug)
    );

    const newGrants = await Promise.all(
        slugsNotFound.map(async (slug) => {
            const team = await db.team.findFirst({
                where: { uniqueId: slug },
            });

            if (!team?.icon) {
                return null;
            }

            const url = await getDownloadUrl(team.icon, 3600);

            return db.s3Grants.create({
                data: {
                    team_id: slug,
                    key: team.icon,
                    url,
                    expired_at: new Date(Date.now() + 3600 * 1000),
                },
            });
        })
    );

    // Merge the new grants with the existing ones
    return updatedGrants.concat(newGrants.filter(Boolean) as S3Grants[]);
}

/**
 * Create or update a presigned URL for a team's object
 */
export async function updatePresignedUrl(
    db: PrismaClient,
    slug: string,
    objectKey: string
): Promise<S3Grants> {
    // Delete existing grants
    await db.s3Grants.deleteMany({
        where: {
            team_id: slug,
            key: {
                startsWith: objectKey.split(".")[0],
            },
        },
    });

    // Generate a new presigned URL
    const url = await getUploadUrl(objectKey, 3600);

    // Store the new presigned URL in the database
    return db.s3Grants.create({
        data: {
            team_id: slug,
            key: objectKey,
            url,
            expired_at: new Date(Date.now() + 3600 * 1000),
        },
    });
}

/**
 * Delete a presigned URL for a team's object
 */
export async function deletePresignedUrl(
    db: PrismaClient,
    slug: string,
    objectKey: string
): Promise<boolean> {
    await db.s3Grants.deleteMany({
        where: {
            team_id: slug,
            key: objectKey,
        },
    });

    // Delete from S3
    const command = new DeleteObjectCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Key: objectKey,
    });

    await s3Client.send(command);
    return true;
}

function validateGrants(grants: S3Grants[]): S3Grants[] {
    return grants.filter((grant) => {
        if (!grant.expired_at) {
            return true;
        }

        const expired = new Date(grant.expired_at) < new Date();
        return !expired;
    });
}