import type { EntityTable } from "dexie";
import type { PDFEntity } from "./db/entities";

export type PDFEntityTable = EntityTable<PDFEntity, "id">