<template>
  <UPage>
    <PDFDnDUpload />
    <UContainer class="space-y-6 pt-10">
      <UCard variant="subtle">
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-1">
            <div class="flex flex-wrap items-center gap-1">
              <UInput
                v-model="search"
                class="w-48"
                icon="i-lucide-search"
                placeholder="Search..."
              />

              <LibrarySelectTypes v-model:types="selectedTypes" />
            </div>

            <div class="flex flex-wrap items-center gap-1">
              <PDFConfirmDeleteModal
                v-if="selectedIds.size"
                :ids="Array.from(selectedIds)"
              >
              </PDFConfirmDeleteModal>
              <UButton
                icon="lucide:plus"
                color="success"
                variant="subtle"
                @click="uploadDialog.open()"
              >
                Upload
              </UButton>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <PDFSelectToolbar
            v-model:selected="selectedIds"
            :pdfs="filteredPdfs"
          />
          <PDFViewGrid
            v-model:selected="selectedIds"
            :pdfs="filteredPdfs"
            selectable
            @delete="handleOnDelete($event)"
          />
        </div>
      </UCard>
    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
import { sortBy } from "es-toolkit";
import type { Arrayable } from "type-fest";
import ConfirmDeleteModal from "~/components/PDF/ConfirmDeleteModal.vue";

const pdfService = useService("pdf");

const selectedTypes = ref(["merged", "original"]);

const {
  data: pdfs,
  refresh,
  suspense,
} = useDexieLiveQuery(
  async () => {
    return pdfService.query(async (t) => {
      const res =
        selectedTypes.value.length > 0
          ? await t.where("tags").anyOf(selectedTypes.value).toArray()
          : await t.toArray();
      return sortBy(res, [(i) => i.ts]).reverse();
    });
  },
  {
    suspense: true,
  },
);

await suspense();
watch(selectedTypes, refresh);

const selectedIds = ref(new Set<string>());

watch(pdfs, () => {
  selectedIds.value = new Set();
});

const { search, items: filteredPdfs } = usePDFFuzzySearch(pdfs);

const overlay = useOverlay();

async function handleOnDelete(ids: Arrayable<string>) {
  await overlay
    .create(ConfirmDeleteModal, { destroyOnClose: true })
    .open({ ids: toArray(ids), showDeleteButton: false });
}

const uploadDialog = usePDFUploadDialog();
</script>

<style scoped></style>
