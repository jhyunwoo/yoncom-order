import { S3Client } from "@aws-sdk/client-s3";

/**
 * Create R2 Client
 */
export default function r2Client({
  endpoint,
  accessKey,
  secretKey,
}: {
  endpoint: string;
  accessKey: string;
  secretKey: string;
}) {
  return new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}
