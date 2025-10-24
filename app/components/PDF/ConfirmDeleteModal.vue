<template>
  <UModal title="Confirm">
    <UButton
      v-if="showDeleteButton"
      color="error"
      variant="subtle"
      icon="i-lucide-trash"
    >
      Delete
      <template #trailing>
        <UKbd>
          {{ ids.length }}
        </UKbd>
      </template>
    </UButton>

    <template #body>
      <div>
        <p>
          Are you sure you want to delete
          <strong>{{ ids.length }}</strong>
          PDF{{ ids.length > 1 ? "s" : "" }}?
        </p>
      </div>
    </template>

    <template #footer="{ close }">
      <div class="flex gap-2 justify-end w-full">
        <UButton color="neutral" variant="subtle" @click="close()">
          Cancel
        </UButton>
        <UButton color="error" @click="onConfirm"> Delete </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const { ids, showDeleteButton = true } = defineProps<{
  ids: string[];
  //when using programatically the delete button is mounted somewhere in the main view
  //so the button can be disabled by this
  showDeleteButton?: boolean;
}>();

const emit = defineEmits<{
  (e: "close" | "confirm" | "cancel"): void;
}>();

const pdfService = useService("pdf");

async function onConfirm() {
  /* Move this outside */
  await pdfService.delete(ids);
  emit("close");
}
</script>
