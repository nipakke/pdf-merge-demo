// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: false },
  modules: ["@nuxt/eslint", "@nuxt/ui"],
  ssr: false,

  css: ["~/assets/css/main.css"],

  app: {
    head: {
      title: "PDF merge",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        { rel: "manifest", href: "/site.webmanifest" },
      ],
    },
  },

  vite: {
    optimizeDeps: {
      entries: [
        "dayjs",
        "dayjs/plugin/localizedFormat",
        "@tanstack/vue-query",
        "pdfjs-dist",
        "pdf-lib",
        "dexie",
        "es-toolkit",
        "@vueuse/core",
        "p-queue",
        "unique-names-generator",
        "@vueuse/integrations/useSortable",
        "@vueuse/integrations/useFuse.mjs",
        "rxjs",
        "zod/v4",
      ],
    },
  },

  //allow _partials to be a component folder for page scoped components
  pages: {
    pattern: ["**/*.vue", "!**/_partials/**"],
  },
});
