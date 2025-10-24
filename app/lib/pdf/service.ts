import type { LivePDFDB } from "./db/db";
import type { PDFEntity } from "./db/entities";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker";
import { GlobalWorkerOptions } from "pdfjs-dist";
import { LivePDF } from "./pdf";
import { generatePDFName } from "./utils/name";
import { PDFDocument } from "pdf-lib";
import { memoize } from "es-toolkit";
import { BlobCache } from "./blob-cache/cache";
import { IDBBlobCache } from "./blob-cache/adapter/idb";
import type { PDFEntityTable } from "./types";

export class PDFService {
  private blobCache: BlobCache;

  constructor(readonly db: LivePDFDB) {
    this.setupWorker();

    //TODO: provide this blobCache adapter in the service constructor params
    this.blobCache = new BlobCache(new IDBBlobCache(this.db));
  }

  private setupWorker() {
    // Initialize pdf.js worker.
    // Create and reuse a single worker instance to avoid loading multiple worker bundles.
    const worker = new pdfjsWorker();
    GlobalWorkerOptions.workerPort = worker;
  }

  //ha valamelyik entity törölve van az nem törli ezt.
  //továbbá nem disposeolja sem így a thumbnail kép vagy ilyesmi blob URL megmarad
  //TODO: kell valami, hogy invalidateljük ezt a cachet
  fromEntity = memoize(
    (pdfEntity: PDFEntity): LivePDF => {
      return new LivePDF(pdfEntity, this.blobCache);
    },
    {
      getCacheKey: (e) => e?.id,
    },
  );

  private invalidatePDF(idOrPdf: string | LivePDF) {
    const pdf =
      idOrPdf instanceof LivePDF ? idOrPdf : this.fromEntity.cache.get(idOrPdf);

    if (!pdf) return;

    pdf.dispose();
    this.fromEntity.cache.delete(pdf.id);
  }

  //actions
  async merge(
    pdfs: LivePDF[],
    opts?: {
      name?: string;
    },
  ): Promise<LivePDF> {
    const name = opts?.name ?? generatePDFName();
    const merged = await PDFDocument.create();

    merged.setTitle(name);

    for (const d of pdfs) {
      const d1 = await PDFDocument.load(await d.file.arrayBuffer());

      const copiedPagesA = await merged.copyPages(d1, d1.getPageIndices());
      copiedPagesA.forEach((page) => merged.addPage(page));
    }

    const pdfBytes = await merged.save();

    const blob = new File([pdfBytes.buffer as ArrayBuffer], name, {
      type: "application/pdf",
    });

    const id = await this.db.pdf.add({
      file: blob,
      name: name,
      ts: Date.now(),
      id: crypto.randomUUID(),
      tags: ["merged"],
    });

    const entity = await this.db.pdf.get(id);

    if (!entity) {
      throw new Error("Error saving");
    }

    return this.fromEntity(entity);
  }

  async upload(files: FileList | File[]) {
    const ids = await Promise.all(
      Array.from(files).map((file) => {
        return this.db.pdf.add({
          id: crypto.randomUUID(),
          file,
          name: file.name,
          ts: Date.now(),
          tags: ["original"],
        });
      }),
    );

    return ids;
  }

  async delete(id: string | string[]) {
    const ids = Array.isArray(id) ? id : [id];

    await this.db.pdf.where("id").anyOf(ids).delete();

    for (const id of ids) {
      this.invalidatePDF(id);
    }
  }

  async edit(data: Partial<PDFEntity>) {
    const id = data.id;
    if (!id) return;

    // this might be a race condition
    const res = await this.db.pdf.update(id, data);

    if (res === 1) {
      this.invalidatePDF(id);
    }
  }

  //queries
  async getAll(): Promise<LivePDF[]> {
    return this.query((t) => t.orderBy("ts").reverse().toArray());
  }

  async getOne(id: string): Promise<LivePDF | undefined> {
    return this.query((t) => t.where("id").equals(id).first());
  }

  //it is not possible to query anything other than rows (aggregate like count)
  async query(
    querier: (t: PDFEntityTable) => Promise<PDFEntity[]>,
  ): Promise<LivePDF[]>;
  async query(
    querier: (t: PDFEntityTable) => Promise<PDFEntity | undefined>,
  ): Promise<LivePDF | undefined>;
  async query(
    querier: (
      t: PDFEntityTable,
    ) => Promise<(PDFEntity | undefined) | PDFEntity[]>,
  ): Promise<LivePDF[] | undefined | LivePDF> {
    const querierRes = await querier(this.db.pdf);

    if (!querierRes) return;

    if (Array.isArray(querierRes)) {
      return querierRes.map((item) => this.fromEntity(item));
    }

    return this.fromEntity(querierRes);
  }
}
