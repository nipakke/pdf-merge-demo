import { Entity } from "dexie";
import type { LivePDFDB } from "./db";

export class PDFEntity extends Entity<LivePDFDB> {
  id!: string;
  name!: string;
  file!: File;
  tags!: string[] | undefined;

  ts!: number;
}

export class BlobCacheEntity extends Entity<LivePDFDB> {
  key!: string;
  tags!: string[] | undefined;
  data!: Blob;
  ts!: number;
}
