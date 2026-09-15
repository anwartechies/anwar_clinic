export interface PutFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

export interface StoredObject {
  /** Storage-relative identifier — the S3 object key, or the filename on disk. */
  key: string;
  /** Absolute, publicly reachable URL. This is what gets pasted into an <img src>. */
  url: string;
  size: number;
  contentType: string;
}

/** A file that is never publicly reachable — no URL, only a storage key. */
export interface PrivateObject {
  key: string;
  size: number;
  contentType: string;
}

export interface PrivateFileStream {
  body: NodeJS.ReadableStream;
  contentType?: string;
  contentLength?: number;
}

export interface StorageDriver {
  /** Shown in the admin UI so it's obvious which backend is live. */
  readonly name: "local" | "s3";
  put(file: PutFileInput): Promise<StoredObject>;
  remove(key: string): Promise<void>;
  /** Rebuilds the public URL for a key — used if the bucket/host changes later. */
  urlFor(key: string): string;

  // Private files (e.g. job-applicant CVs). Stored outside anything served
  // publicly; read back only through authenticated routes that stream them.
  putPrivate(file: PutFileInput, folder: string): Promise<PrivateObject>;
  getPrivate(key: string): Promise<PrivateFileStream>;
  removePrivate(key: string): Promise<void>;
}

/** Folder names for private files are fixed strings in code, never user input. */
export function assertSafeFolder(folder: string): void {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(folder)) throw new Error(`Invalid private folder: ${folder}`);
}

// Keys are generated, never taken from the client: a user-supplied filename can
// contain path traversal, collide with an existing object, or break in a URL.
export function buildObjectKey(originalName: string): string {
  const ext = (originalName.match(/\.[a-zA-Z0-9]{1,8}$/)?.[0] ?? "").toLowerCase();
  const stem = originalName
    .slice(0, originalName.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "file";
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${stem}-${stamp}${rand}${ext}`;
}
