<template>
  <!-- pointer events none makes it so the image can't be dragged 
  but also can't open the the context menu. 
  this is not the best but otherwise the image is dragged even if we don't want it to be
  -->
  <div class="bg-white rounded-md aspect-[1/1.4142] overflow-hidden">
    <img v-if="url" :src="url" class="pointer-events-none" />
    <!-- TODO: Failed to load img or some error -->
    <img v-else />
    {{ error }}
  </div>
</template>

<script setup lang="ts">
import { useAsyncState, useObjectUrl } from "@vueuse/core";
import type { LivePDF } from "~/lib/pdf/pdf";

const { pdf, pageNumber } = defineProps<{
  pdf: LivePDF;
  pageNumber: number;
}>();

const { state: imageBlob, error } = useAsyncState(async () => {
  return pdf.getPageImage(pageNumber);
}, null);

const url = useObjectUrl(imageBlob);
</script>
