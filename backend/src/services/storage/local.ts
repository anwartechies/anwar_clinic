import fs from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
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

// Disk-backed stand-in for S3. Files land in <backend>/uploads and are served
// publicly at /uploads/<key> by app.ts. URLs are absolute and stable, so they
// can be pasted straight into a landing page's <img src> today and keep working
// until the S3 driver takes over.
const UPLOAD_DIR = path.resolve(process.cwd(), "uploads");
// Sibling of uploads/ that app.ts does NOT serve — private files live here.
const PRIVATE_DIR = path.resolve(process.cwd(), "uploads-private");

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function privatePath(key: string): string {
  const target = path.resolve(PRIVATE_DIR, key);
  if (!target.startsWith(PRIVATE_DIR + path.sep)) throw new Error("Invalid private file key");
  return target;
}

export class LocalStorageDriver implements StorageDriver {
  readonly name = "local" as const;

  urlFor(key: string) {
    return `${env.publicUrl}/uploads/${key}`;
  }

  async put(file: PutFileInput): Promise<StoredObject> {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const key = buildObjectKey(file.originalName);
    await fs.writeFile(path.join(UPLOAD_DIR, key), file.buffer);
    return {
      key,
      url: this.urlFor(key),
      size: file.buffer.length,
      contentType: file.mimeType,
    };
  }

  async remove(key: string): Promise<void> {
    // Guard against a key escaping the upload dir even though keys are generated.
    const target = path.join(UPLOAD_DIR, path.basename(key));
    await fs.rm(target, { force: true });
  }

  async putPrivate(file: PutFileInput, folder: string): Promise<PrivateObject> {
    assertSafeFolder(folder);
    const key = `${folder}/${buildObjectKey(file.originalName)}`;
    const target = privatePath(key);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, file.buffer);
    return { key, size: file.buffer.length, contentType: file.mimeType };
  }

  async getPrivate(key: string): Promise<PrivateFileStream> {
    const target = privatePath(key);
    const stat = await fs.stat(target);
    return {
      body: createReadStream(target),
      contentType: CONTENT_TYPES[path.extname(target).toLowerCase()] || "application/octet-stream",
      contentLength: stat.size,
    };
  }

  async removePrivate(key: string): Promise<void> {
    await fs.rm(privatePath(key), { force: true });
  }
}
