import { QueryClient } from "@tanstack/vue-query";

export default defineNuxtPlugin(() => {
  //query client for local pdfs from indexeddb
  const pdfQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        gcTime: 1000 * 60 * 60 * 24, // 24 hours
      },
    },
  });

  return {
    provide: {
      pdfQueryClient,
    },
  };
});
