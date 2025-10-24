import type { EntityTable } from "dexie";
import type { BlobCacheAdapter } from ".";
import type { LivePDFDB } from "../../db/db";
import type { BlobCacheEntity } from "../../db/entities";

export class IDBBlobCache implements BlobCacheAdapter {
  private readonly cacheTable: EntityTable<BlobCacheEntity, "key">;
  constructor(db: LivePDFDB) {
    this.cacheTable = db.blobCache;
  }

  async get(key: string): Promise<Blob | undefined> {
    return (await this.cacheTable.get(key))?.data;
  }

  async set(
    key: string,
    data: Blob,
    opts: {
      tags?: string[];
      ts: number;
    },
  ): Promise<string> {
    await this.cacheTable.put({
      key: key,
      data: data,
      tags: opts?.tags,
      ts: opts.ts,
    });

    return key;
  }
}
