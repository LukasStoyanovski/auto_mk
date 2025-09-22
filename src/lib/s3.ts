// file: src/lib/s3.ts
import { S3Client, CreateBucketCommand, PutBucketPolicyCommand, HeadBucketCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.S3_REGION || "us-east-1",
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true, // required for MinIO
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || ""
  }
});

export async function ensureBucketPublic(bucket: string) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  }
  // Public read policy (dev only)
  const policy = {
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`]
      }
    ]
  };
  try {
    await s3.send(new PutBucketPolicyCommand({ Bucket: bucket, Policy: JSON.stringify(policy) }));
  } catch (e) {
    // MinIO may need Console policy if disabled; ignore in dev
    console.warn("Bucket policy set warning:", e);
  }
}

export function s3PublicUrl(key: string) {
  const base = process.env.S3_PUBLIC_URL?.replace(/\/$/, "") || "";
  const bucket = process.env.S3_BUCKET;
  return `${base}/${bucket}/${key}`;
}
