<template>
  <div class="space-y-1 hover:z-30 group/card relative">
    <div class="flex gap-1 absolute p-1 justify-between w-full z-10">
      <div>
        <UButton
          size="sm"
          :href="pdf.download.url"
          target="_blank"
          icon="lucide:external-link"
        />
      </div>

      <div class="flex gap-1">
        <UTooltip text="Download" :delay-duration="200">
          <PDFDownloadButton
            v-if="downloadable"
            :name="pdf.name"
            :blob="pdf.file"
          />
        </UTooltip>

        <UButton
          v-if="onDelete"
          size="sm"
          color="error"
          icon="lucide:trash"
          @click="onDelete(pdf.id)"
        />
      </div>
    </div>

    <UChip
      size="3xl"
      position="top-left"
      color="success"
      :show="pdf.tags?.includes('merged')"
      class="w-full"
    >
      <div
        class="w-full aspect-[1/1.4142] relative rounded-md"
        :class="{
          'ring-primary-800': selected && selectable && !sortable,
          'cursor-pointer': selectable && !sortable,
          'cursor-move': sortable,
        }"
        @click="selectable && $emit('select', pdf.id)"
      >
        <div
          v-if="selected && selectable"
          class="absolute h-full w-full bg-primary-500/20 select-none p-2 rounded-sm ring-2 ring-blue-400"
        />

        <Suspense>
          <PDFPageImage :pdf="pdf" :page-number="1" />

          <template #fallback>
            <USkeleton class="w-full h-full" />
          </template>
        </Suspense>
      </div>
    </UChip>

    <OverviewSlideover v-if="showName" :pdf="pdf">
      <div
        class="hover:bg-primary-500 hover:max-w-none hover:ring-1 ring-zinc-500 shadow-sm truncate max-w-full w-fit px-1 rounded-xs text-nowrap cursor-pointer"
      >
        {{ pdf.name }}
      </div>
    </OverviewSlideover>
  </div>
</template>

<script setup lang="ts">
import type { LivePDF } from "~/lib/pdf/pdf";
import OverviewSlideover from "../OverviewSlideover.vue";

const {
  pdf,
  downloadable = true,
  showName = true,
  sortable = false,
  onDelete = undefined,
} = defineProps<{
  pdf: LivePDF;
  selected?: boolean;
  selectable?: boolean;
  downloadable?: boolean;
  showName?: boolean;
  sortable?: boolean;
  onDelete?: (id: string) => void;
}>();

const _emit = defineEmits<{
  select: [string];
}>();
</script>

<style scoped></style>
