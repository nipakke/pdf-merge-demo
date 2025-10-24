import { memoize } from "es-toolkit";
import { getDocument } from "pdfjs-dist";
import type { PDFEntity } from "./db/entities";

import PQueue from "p-queue";
import type { BlobCache } from "./blob-cache/cache";

//this is far from perfect
//the disposing is not great and not even really used
//therefore there are some things like the object url is not revoked
//cached stuff with the "memoized" util is not disposed
export class LivePDF {
  uid: string = crypto.randomUUID();

  id: string;
  name: string;
  file: Blob;
  tags?: string[];
  createdAt: number;

  private inputURL: string;

  static snapshotQueue = new PQueue({
    concurrency: 3,
  });

  constructor(
    entity: Pick<PDFEntity, "id" | "name" | "file" | "tags" | "ts">,
    private readonly blobCache: BlobCache,
  ) {
    this.id = entity.id;
    this.file = entity.file;
    this.name = entity.name;
    this.tags = entity.tags;

    this.createdAt = entity.ts;

    this.inputURL = URL.createObjectURL(this.file);

    if (!this.inputURL) {
      throw new Error("uknown error while getting inputurl");
    }

    this.download = {
      url: URL.createObjectURL(this.file),
      name: `${this.name}.pdf`,
    };
  }

  async numPages() {
    const doc = await this.getDocument();
    return doc.numPages;
  }

  dispose() {
    URL.revokeObjectURL(this.download.url);
  }

  download: {
    url: string;
    name: string;
  };

  getDocument = memoize(async () => {
    if (!this.file) {
      throw new Error(`File not found - ${this.id}`);
    }
    return LivePDF.snapshotQueue.add(async () => {
      if (!this.inputURL) {
        throw new Error("Error getting document");
      }

      const input = await this.file.arrayBuffer();

      const loadingTask = getDocument(input);
      const pdf = await loadingTask.promise;

      return pdf;
    });
  });

  private async getPageImageBlob(opts: {
    pageNumber: number;
    /**
     * viewport scale of the page
     * @default 0.5
     */
    scale?: number;
  }) {
    const { pageNumber, scale = 0.5 } = opts;
    const pdfDoc = await this.getDocument();

    //use the first page if not specified otherwise
    const page = await pdfDoc.getPage(pageNumber);

    const tempCanvas = document.createElement("canvas");
    const canvasContext = tempCanvas.getContext("2d")!;
    const pageViewport = page.getViewport({ scale });

    tempCanvas.width = pageViewport.width;
    tempCanvas.height = pageViewport.height;

    const renderTask = page.render({
      canvasContext,
      viewport: pageViewport,
      canvas: tempCanvas,
    });

    await renderTask.promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      tempCanvas.toBlob((blob) => {
        if (blob instanceof Blob) {
          resolve(blob);
        }
        reject(undefined);
      });
    });

    return blob;
  }

  getPageImage = memoize(async (pageNumber: number = 1): Promise<Blob> => {
    const blob = await this.blobCache.getOrSet({
      key: `${this.id}-${pageNumber}`,
      factory: async () => {
        const blob = await this.getPageImageBlob({
          pageNumber,
        });

        return blob;
      },
    });
    return blob;
  });
}
