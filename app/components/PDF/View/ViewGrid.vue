<template>
  <div>
    <div class="space-y-4">
      <div
        class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2"
      >
        <PDFViewCard
          v-for="pdf in pdfs"
          :key="pdf.uid"
          class="select-none relative"
          :pdf="pdf"
          :selectable="selectable"
          :selected="selectedIds.has(pdf.id)"
          :downloadable="downloadable"
          @select="handleSelect($event)"
          @delete="onDelete"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LivePDF } from "~/lib/pdf/pdf";

const {
  pdfs,
  selectable = false,
  downloadable = true,
  onDelete = undefined,
} = defineProps<{
  pdfs: LivePDF[];
  selectable?: boolean;
  downloadable?: boolean;
  onDelete?: (id: string) => void;
}>();

const selectedIds = defineModel<Set<string>>("selected", {
  default: new Set(),
});

function handleSelect(id: string) {
  if (!selectedIds.value.has(id)) {
    selectedIds.value.add(id);
  } else {
    selectedIds.value.delete(id);
  }
}
</script>
