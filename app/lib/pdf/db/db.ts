import Dexie from "dexie";
import type { EntityTable } from "dexie";
import {
  BlobCacheEntity,
  PDFEntity,
  PDFPageImageCacheEntity,
} from "./entities";

export class LivePDFDB extends Dexie {
  pdf!: EntityTable<PDFEntity, "id">;
  pageImageCache!: EntityTable<PDFPageImageCacheEntity, "key">;
  blobCache!: EntityTable<BlobCacheEntity, "key">;

  constructor() {
    super("pdf-app");
    this.version(5).stores({
      pdf: "id, name, *tags, ts",
      pageImageCache: "key, pdfId, ts",
      blobCache: "key, *tags, ts",
    });

    this.pdf.mapToClass(PDFEntity);
    this.pageImageCache.mapToClass(PDFPageImageCacheEntity);
    this.blobCache.mapToClass(BlobCacheEntity);
  }
}
