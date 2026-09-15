import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env";
import {
  StorageDriver,
  PutFileInput,
  StoredObject,
  PrivateObject,
  PrivateFileStream,
  buildObjectKey,
  assertSafeFolder,
} from "./types";

// Real S3 driver. Nothing here needs editing when credentials arrive — set the
// env vars listed in .env.example and STORAGE_DRIVER=s3, and this takes over.
export class S3StorageDriver implements StorageDriver {
  readonly name = "s3" as const;

  private client = new S3Client({
    region: env.s3.region,
    ...(env.s3.accessKeyId && env.s3.secretAccessKey
      ? {
          credentials: {
            accessKeyId: env.s3.accessKeyId,
            secretAccessKey: env.s3.secretAccessKey,
          },
        }
      : {}), // fall back to the ambient AWS credential chain (IAM role, ~/.aws)
  });

  urlFor(key: string) {
    const prefix = env.s3.keyPrefix ? `${env.s3.keyPrefix}/` : "";
    // A CDN/custom domain wins when set; otherwise the bucket's regional URL.
    if (env.s3.publicBaseUrl) {
      return `${env.s3.publicBaseUrl.replace(/\/$/, "")}/${prefix}${key}`;
    }
    return `https://${env.s3.bucket}.s3.${env.s3.region}.amazonaws.com/${prefix}${key}`;
  }

  async put(file: PutFileInput): Promise<StoredObject> {
    const key = buildObjectKey(file.originalName);
    const prefix = env.s3.keyPrefix ? `${env.s3.keyPrefix}/` : "";

    await this.client.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: `${prefix}${key}`,
        Body: file.buffer,
        ContentType: file.mimeType,
        // Long cache: keys are unique per upload, so an object is never mutated.
        CacheControl: "public, max-age=31536000, immutable",
      })
    );

    return {
      key,
      url: this.urlFor(key),
      size: file.buffer.length,
      contentType: file.mimeType,
    };
  }

  async remove(key: string): Promise<void> {
    const prefix = env.s3.keyPrefix ? `${env.s3.keyPrefix}/` : "";
    await this.client.send(
      new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: `${prefix}${key}` })
    );
  }

  // Private keys are stored whole (e.g. "private/resumes/cv-abc.pdf") and never
  // go under the public media prefix.
  private assertPrivate(key: string) {
    const publicRoot = (env.s3.keyPrefix || "").split("/")[0];
    const isUnderPrivatePrefix = key.startsWith(`${env.s3.privateKeyPrefix}/`);
    const isUnderPublicPrefix = publicRoot !== "" && key.startsWith(`${publicRoot}/`);
    if (!isUnderPrivatePrefix || isUnderPublicPrefix || key.includes("..")) {
      throw new Error("Refusing to use a private file key outside the private prefix");
    }
  }

  async putPrivate(file: PutFileInput, folder: string): Promise<PrivateObject> {
    assertSafeFolder(folder);
    const key = `${env.s3.privateKeyPrefix}/${folder}/${buildObjectKey(file.originalName)}`;
    this.assertPrivate(key);
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimeType,
        CacheControl: "private, no-store",
      })
    );
    return { key, size: file.buffer.length, contentType: file.mimeType };
  }

  async getPrivate(key: string): Promise<PrivateFileStream> {
    this.assertPrivate(key);
    const out = await this.client.send(new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }));
    return {
      body: out.Body as NodeJS.ReadableStream,
      contentType: out.ContentType,
      contentLength: out.ContentLength,
    };
  }

  async removePrivate(key: string): Promise<void> {
    this.assertPrivate(key);
    await this.client.send(new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: key }));
  }
}
