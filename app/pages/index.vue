<template>
  <UPage class="pt-4">
    <PDFDnDUpload @drop="handleUploadedIds($event)" />
    <SelectPDFModal
      v-model:open="selectModalOpen"
      :selected-ids="selectedIds"
      :show-button="false"
    />

    <UContainer class="space-y-4">
      <UCard
        variant="subtle"
        :ui="{
          body: 'relative',
        }"
      >
        <template #header>
          <div class="flex justify-between gap-2 items-center">
            <div>PDFs to merge</div>

            <UButton
              icon="lucide:file"
              variant="subtle"
              color="success"
              @click="setSelectModalOpen(true)"
            >
              Select existing PDF
            </UButton>
          </div>
        </template>

        <div class="relative h-full w-full">
          <!-- SortableJS breaks if we use v-if here because the ref element sometimes doesn't exist -->
          <div v-show="sortedPdfs?.length" class="space-y-4">
            <div
              class="flex items-center justify-center gap-2 text-gray-400 text-xl"
            >
              <UIcon name="lucide:move" class="text-lg" />
              <span>You can drag and drop to reorder</span>
            </div>

            <div
              ref="drag-wrapper"
              class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"
            >
              <div v-for="pdf in sortedPdfs" :key="pdf.id" class="relative">
                <PDFViewCard
                  :key="pdf.id"
                  class="cursor-move"
                  :pdf="pdf"
                  @delete="removeSelected(pdf.id)"
                />
              </div>
            </div>
          </div>

          <div v-if="!sortedPdfs?.length">
            <div class="flex justify-center items-center">
              <div class="space-y-2">
                <div class="p-2 text-lg text-zinc-400">
                  Drop PDFs anytime here, or:
                </div>
                <div class="flex flex-col gap-2">
                  <UButton
                    icon="lucide:file"
                    variant="subtle"
                    color="success"
                    @click="setSelectModalOpen(true)"
                  >
                    Select existing PDF
                  </UButton>

                  <UButton
                    variant="subtle"
                    color="primary"
                    icon="lucide:upload"
                    @click="uploadDialog.open()"
                  >
                    Upload new file
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <template v-if="!mergedPdf && sortedPdfs && sortedPdfs.length" #footer>
          <div class="flex justify-center">
            <UButton
              :disabled="sortedPdfs.length <= 1"
              color="primary"
              icon="lucide:merge"
              block
              size="xl"
              :loading="merge.isLoading.value"
              @click="mergeCurrent()"
            >
              Merge selected
            </UButton>
          </div>
        </template>
      </UCard>

      <UCard v-if="mergedPdf" variant="subtle">
        <template #header>
          <div class="flex justify-end">
            <UButton
              variant="subtle"
              color="warning"
              icon="lucide:rotate-ccw"
              @click="() => (mergedPdf = undefined)"
            >
              Reset
            </UButton>
          </div>
        </template>

        <div class="flex items-center justify-center">
          <div class="flex flex-col gap-3">
            <div class="flex justify-center">
              <div class="max-w-50">
                <PDFViewCard
                  v-if="mergedPdf"
                  class=""
                  :pdf="mergedPdf"
                  @delete="mergedPdf = undefined"
                />
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { useAsyncState, useToggle, watchDeep } from "@vueuse/core";
import SelectPDFModal from "~/components/SelectPDFModal.vue";
import { useSortable } from "@vueuse/integrations/useSortable";
import type { LivePDF } from "~/lib/pdf/pdf";
import type { Arrayable } from "type-fest";

const pdfService = useService("pdf");
const selectedIds = ref(new Set<string>());
const [selectModalOpen, setSelectModalOpen] = useToggle(false);

const {
  data: pdfsRes,
  suspense,
  refresh,
} = useDexieLiveQuery(
  async () => {
    const ids = Array.from(unref(selectedIds));
    return pdfService.query((t) => {
      return t.where("id").anyOf(ids).toArray();
    });
  },
  {
    suspense: true,
  },
);

await suspense();

watchDeep(selectedIds, refresh);

//#region order
//the order is automatically determined by sortablejs
//we just need to keep the previous order when refreshing the array
const sortedPdfs = shallowRef<LivePDF[]>([]);

watchDeep(
  pdfsRes,
  (pdfs) => {
    //to keep the order we need to use the last list order
    const order = sortedPdfs.value.map((t) => t.id);
    sortedPdfs.value = pdfs.sort(
      (a, b) => order.indexOf(a.id) - order.indexOf(b.id),
    );
  },
  { immediate: true },
);

const sortWrapper = useTemplateRef<HTMLElement>("drag-wrapper");
useSortable(sortWrapper, sortedPdfs, {
  animation: 100,
});
//#region order

function removeSelected(ids: Arrayable<string>) {
  toArray(ids).forEach((id) => {
    selectedIds.value.delete(id);
  });
}

//#region merge
const toast = useToast();

const { state: mergedPdf, ...merge } = useAsyncState(
  async (pdfs: MaybeRef<LivePDF[]>) => {
    return pdfService.merge(unref(pdfs));
  },
  undefined,
  {
    immediate: false,
    onError(e) {
      const message = !(e instanceof Error) ? "Unknown error" : e.message;
      toast.add({
        title: `Merge Error`,
        description: message,
        color: "error",
      });
    },
  },
);

watchDeep(selectedIds, () => (mergedPdf.value = undefined));

function mergeCurrent() {
  merge.executeImmediate(sortedPdfs);
}
//#endregion merge

//#region upload
const uploadDialog = usePDFUploadDialog();
uploadDialog.onUpload((ids) => {
  handleUploadedIds(ids);
});

function handleUploadedIds(ids: string[]) {
  //put the new ids at the end
  selectedIds.value = new Set([...selectedIds.value, ...ids]);
}
//#endregion upload
</script>
