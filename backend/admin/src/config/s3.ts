import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { env } from './env';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT !== 'https://s3.amazonaws.com' ? env.S3_ENDPOINT : undefined,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? '',
  },
  forcePathStyle: env.S3_ENDPOINT !== 'https://s3.amazonaws.com', // for MinIO
});

export interface PresignedUploadParams {
  folder: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}

export async function generateUploadPresignedUrl(
  params: PresignedUploadParams
): Promise<PresignedUploadResult> {
  if (!ALLOWED_MIME_TYPES.includes(params.contentType)) {
    throw new Error(`File type not allowed: ${params.contentType}`);
  }

  if (params.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(`File size exceeds maximum allowed: ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`);
  }

  const ext = path.extname(params.fileName) || '';
  const key = `${params.folder}/${uuidv4()}${ext}`;
  const expiresIn = 300; // 5 minutes

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET_NAME,
    Key: key,
    ContentType: params.contentType,
    ContentLength: params.fileSizeBytes,
    ServerSideEncryption: 'AES256',
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
  const publicUrl = `${env.S3_PUBLIC_URL ?? `https://${env.S3_BUCKET_NAME}.s3.${env.S3_REGION}.amazonaws.com`}/${key}`;

  return { uploadUrl, key, publicUrl, expiresIn };
}

export async function deleteS3Object(key: string): Promise<void> {
  await s3Client.send(
    new DeleteObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key })
  );
}

export async function generateDownloadPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: env.S3_BUCKET_NAME, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn });
}
