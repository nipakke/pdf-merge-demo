<template>
  <Teleport to="body">
    <div
      v-if="isActivated"
      v-show="isOverDropZone"
      class="fixed h-screen w-screen top-0 left-0 bg-white/50 z-1000 flex justify-center items-center transition-all"
    >
      <div
        class="text-4xl text-shadow-sm rounded-md px-4 py-3 shadow-xl bg-elevated"
      >
        Drop anywhere
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useDropZone } from "@vueuse/core";

const emit = defineEmits<{
  drop: [string[]];
}>();

//on a kept alive page the dropzone will be visible on other pages
//hide the dropzone if the component is not active and block the drop handling
const isActivated = useActivated();

const pdfService = useService("pdf");
async function onDrop(files: File[] | null) {
  // if (!isActivated.value) return;
  // called when files are dropped on zone

  if (files) {
    const ids = await pdfService.upload(files);
    emit("drop", ids);
  }
}

const { isOverDropZone } = useDropZone(
  () => (isActivated.value ? document : undefined),
  {
    onDrop,
    // specify the types of data to be received.
    dataTypes: ["application/pdf"],
    // control multi-file drop
    multiple: true,
    // whether to prevent default behavior for unhandled events
    preventDefaultForUnhandled: false,
  },
);
</script>

<style scoped></style>
