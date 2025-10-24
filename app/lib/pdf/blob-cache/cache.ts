import type { Promisable } from "type-fest";
import type { BlobCacheAdapter } from "./adapter";

export class BlobCache {
  constructor(private cacheAdapter: BlobCacheAdapter) {}

  async set(
    key: string,
    data: Blob,
    opts?: {
      tags?: string[];
    },
  ): Promise<string> {
    return this.cacheAdapter.set(key, data, {
      tags: opts?.tags,
      ts: Date.now(),
    });
  }

  async get(key: string): Promise<Blob | undefined> {
    //TODO: some TTL, global and scoped option for it
    return this.cacheAdapter.get(key);
  }

  async getOrSet<TRes extends Blob>(opts: {
    key: string;
    factory: () => Promisable<TRes>;
    // validate?: this can be some function that validates the data returned
  }) {
    const cached = await this.get(opts.key);

    if (cached) {
      //validate here with the validate option
      return cached;
    }

    const factoryRes = await opts.factory();

    if (factoryRes) {
      await this.set(opts.key, factoryRes);
    }

    return factoryRes;
  }
}
