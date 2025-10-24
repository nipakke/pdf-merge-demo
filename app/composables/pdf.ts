import {
  createEventHook,
  createInjectionState,
  useFileDialog,
  watchDebounced,
} from "@vueuse/core";
import { useFuse } from "@vueuse/integrations/useFuse.mjs";
import type { PDFEntity } from "~/lib/pdf/db/entities";
import type { LivePDF } from "~/lib/pdf/pdf";
import type { FuseResult } from "fuse.js";
import { useMutation } from "@tanstack/vue-query";
import { usePDFQueryClient } from "./pdf/query-client";

export function usePDF(entity: PDFEntity[]): LivePDF[];
export function usePDF(entity: PDFEntity): LivePDF;
export function usePDF(entity: PDFEntity | PDFEntity[]) {
  const service = useService("pdf");

  if (Array.isArray(entity)) {
    return entity.map((e) => service.fromEntity(e));
  }

  return service.fromEntity(entity);
}

export const [usePDFProvider, injectPDFProvider] = createInjectionState(
  (i: MaybeRefOrGetter<LivePDF[]>) => {
    const pdfs = shallowRef(toValue(i));

    return {
      pdfs,
    };
  },
);

// This function doesn't work very well because the fuzzy search is not configured properly.
export function usePDFFuzzySearch(
  pdfs: MaybeRefOrGetter<LivePDF[] | undefined>,
) {
  const pdfsRef = computed(() => toValue(pdfs) ?? []);
  const search = ref<string>("");

  function mapResults(res: MaybeRefOrGetter<FuseResult<LivePDF>[]>): LivePDF[] {
    return toValue(res).map((i) => i.item) ?? [];
  }

  const fuz = useFuse(search, pdfsRef, {
    matchAllWhenSearchEmpty: true,
    fuseOptions: {
      keys: ["name"],
    },
  });

  const items = shallowRef<LivePDF[]>(toValue(pdfs) ?? []);

  watchDebounced(
    fuz.results,
    (res) => {
      items.value = mapResults(res);
    },
    {
      // throttle: 100,
      debounce: 100,
      deep: false,
      immediate: false,
    },
  );

  return {
    search,
    items: shallowReadonly(items),
  };
}

/**
 * Hook for handling PDF file upload dialog functionality
 *
 * @returns {Object} An object containing the following methods:
 * - open: Function to open a file dialog that accepts PDF files
 * - onUpload: Event hook callback that triggers when files are successfully uploaded,
 *   providing an array of uploaded file IDs
 *
 * @example
 * ```typescript
 * const { open, onUpload } = usePDFUploadDialog();
 *
 * // Open file dialog
 * open();
 *
 * // Handle successful upload
 * onUpload((fileIds) => {
 *   console.log('Uploaded files:', fileIds);
 * });
 * ```
 */
export function usePDFUploadDialog() {
  const fileDialog = useFileDialog();
  const service = useService("pdf");

  const { trigger: uploadTrigger, on: onUpload } =
    createEventHook<[Array<string>]>();

  fileDialog.onChange(async (list) => {
    if (!list) return;

    const ids = await service.upload(list);

    uploadTrigger(ids);
  });

  function open() {
    fileDialog.open({
      accept: "application/pdf",
      reset: true,
    });
  }

  return {
    open,
    onUpload,
  };
}

export function usePDFMergeMutation() {
  const service = useService("pdf");

  return useMutation(
    {
      mutationKey: ["merge-mutation"],
      async mutationFn(pdfs: MaybeRef<LivePDF[]>): Promise<LivePDF> {
        return service.merge(unref(pdfs));
      },
    },
    usePDFQueryClient(),
  );
}
