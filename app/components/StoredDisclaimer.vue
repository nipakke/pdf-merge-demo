<template>
  <UAlert v-if="showDisclaimer" color="warning">
    <template #title> Your PDFs Stay Here </template>
    <template #description>
      This tool keeps PDFs in your browser's storage. Nothing is uploaded.
      Manage or delete them anytime from the
      <ULink to="/library" class="text-primary-500">Library</ULink> page.
    </template>

    <template #actions>
      <UButton @click="setShowDisclaimer(false)"> Don't show again </UButton>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
import { useLocalStorage } from "@vueuse/core";

if (import.meta.server) {
  throw createError("StoredDisclaimer can only be used on the client!");
}

const showDisclaimer = useLocalStorage("show-disclaimer", true, {
  listenToStorageChanges: true,
});

function setShowDisclaimer(v: boolean) {
  showDisclaimer.value = v;
}

//reset show if there are not pdfs uploaded
const entities = await useService("pdf").db.pdf.count();
if (entities <= 0) {
  setShowDisclaimer(true);
}
</script>

<style scoped></style>
