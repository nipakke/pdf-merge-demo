<template>
  <UModal v-model:open="open" fullscreen>
    <template #header>
      <UContainer class="flex justify-between gap-4">
        <div class="">
          <div>Select PDFs</div>

          <div class="text-sm text-zinc-500 font-thin">
            Select an existing PDF or add a new one
          </div>
        </div>
      </UContainer>
    </template>

    <template #footer>
      <UContainer class="flex justify-between gap-4">
        <div />
        <div>
          <UButton @click="open = false"> Finish </UButton>
        </div>
      </UContainer>
    </template>
    <template #body>
      <UContainer class="space-y-4">
        <div class="flex justify-center gap-1 items-center">
          <div class="">Drag and drop a PDF here or</div>

          <UButton
            variant="subtle"
            icon="lucide:upload"
            @click="openFileDialog()"
          >
            Upload a file
          </UButton>
        </div>

        <PDFViewGrid
          v-model:selected="selectedIds"
          :downloadable="false"
          :pdfs="pdfs"
          selectable
        />
        <!-- @delete="deleteByIds($event)" -->

        <!-- <div class="grid 
        grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8
        gap-2 flex-wrap">
          <PDFViewCard class="select-none" :selected="selectedIds.has(pdf.id)" v-for="pdf in pdfs" :key="pdf.id"
            :pdf="pdf" downloadable selectable @select="handlePDFSelect(pdf.id)" />
        </div> -->
      </UContainer>

      <!-- <div class="flex gap-2">
        <div v-for="pdf in pdfs">
          <PDFEntityPreview class="w-60 aspect-[1/1.4142]" :pdf="pdf" />
        </div>
      </div> -->
    </template>

    <template #default>
      <slot v-if="showButton" name="open-button">
        <UButton label="Open"> Add </UButton>
      </slot>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useFileDialog } from "@vueuse/core";

const { showButton = true } = defineProps<{
  showButton?: boolean;
}>();

const open = defineModel<boolean>("open", { default: false });

const pdfService = useService("pdf");

const selectedIds = defineModel<Set<string>>("selectedIds", {
  default: new Set(),
});

const { data: pdfs, suspense } = useDexieLiveQuery(
  () => {
    return pdfService.getAll();
  },
  {
    suspense: true,
  },
);

await suspense();

// const { data: pdfs, refetch: refreshPdfEntities } = useAllPDFsQuery()

/* const { state: pdfEntities, isLoading, isReady, execute: refreshPdfEntities } = useAsyncState(async () => {
  return db.pdf.orderBy("ts").reverse().toArray()
}, undefined, {
  resetOnExecute: false
}) */

/* const pdfEntities = useDexieLiveQuery(() => {
  return db.pdf.orderBy("ts").reverse().toArray()
  }) */

// const pdfs = computed(() => pdfs.value?.map(t => usePDF(t)) ?? [])

/* Select */
// const selectedIds = ref(new Set<string>(props.selectedIds))
//TODO: ne így legyen hanem map legyen az entities vagy ilyesmi vagy a livepdfs és akkor könnyű kiválasztani

/* watchDeep(selectedIds, ids => {
  selectedIdsModel.value = Array.from(ids)
}, { immediate: true }) */

/* Add new */
const fileDialog = useFileDialog();

fileDialog.onChange(async (list) => {
  if (!list) return;

  const ids = await pdfService.upload(list);

  //using a new set here somehow breaks reactivity
  //no idea why. it works somewhere else
  // selectedIds.value = new Set([...selectedIds.value, ...ids])
  const newSelection = [...selectedIds.value, ...ids];
  selectedIds.value.clear();
  newSelection.forEach((v) => selectedIds.value.add(v));
});

function openFileDialog() {
  fileDialog.open({
    accept: "application/pdf",
    reset: true,
  });
}
</script>

<style scoped></style>
