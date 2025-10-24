import { LivePDFDB } from "~/lib/pdf/db/db";
import { PDFService } from "~/lib/pdf/service";

export default defineNuxtPlugin(() => {
  const db = new LivePDFDB();
  const pdf = new PDFService(db);

  return {
    provide: {
      services: {
        pdf,
      },
    },
  };
});
