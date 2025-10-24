import type { Promisable } from "type-fest";

export interface BlobCacheAdapter {
  get(key: string): Promisable<Blob | undefined>

  set(key: string, data: Blob, opts?: {
    tags?: string[];
    ts: number;
  }): Promisable<string>
}