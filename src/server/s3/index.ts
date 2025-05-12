import { S3Client } from "@aws-sdk/client-s3";
import { env } from "~/env";

const s3 = new S3Client({
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY,
		secretAccessKey: env.AWS_ACCESS_SECRET,
	},
	region: env.AWS_BUCKET_REGION,
});

export default s3;
