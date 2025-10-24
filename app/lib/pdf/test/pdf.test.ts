import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { LivePDF } from "../pdf";
import { LivePDFDB } from "../db/db";
import { BlobCache } from "../blob-cache/cache";

const testFile = readFileSync(join(import.meta.dirname, "test.pdf"));
const testBlob = new File([testFile], "", { type: "application/pdf" });

test("dimi", () => {
  const testDb = new LivePDFDB();

  const blobCache = new BlobCache(testDb);

  new LivePDF(
    {
      file: testBlob,
      id: crypto.randomUUID(),
      name: "asd",
      tags: undefined,
      ts: Date.now(),
    },
    blobCache,
  );

  expect(1).toBe(1);
});
