import Dexie from "dexie";
import type { EntityTable } from "dexie";
import {
  BlobCacheEntity,
  PDFEntity,
} from "./entities";

export class LivePDFDB extends Dexie {
  pdf!: EntityTable<PDFEntity, "id">;
  blobCache!: EntityTable<BlobCacheEntity, "key">;

  constructor() {
    super("pdf-app");
    this.version(6).stores({
      pdf: "id, name, *tags, ts",
      blobCache: "key, *tags, ts",
    });

    this.pdf.mapToClass(PDFEntity);
    this.blobCache.mapToClass(BlobCacheEntity);
  }
}
