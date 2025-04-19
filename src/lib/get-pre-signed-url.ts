import r2Client from "./r2-client";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export default async function getPreSignedUrl(
  fileName: string,
  contentType: string,
  endpoint: string,
  accessKey: string,
  secretKey: string,
) {
  return getSignedUrl(
    r2Client({ endpoint, accessKey, secretKey }),
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    }),
    { expiresIn: 3600 },
  );
}
