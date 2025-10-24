<template>
  <USelect
    v-model="selectedTypes"
    multiple
    :items="typeSelectOptions"
    class="w-48"
  >
    <template #default="{ modelValue }">
      <template
        v-if="
          modelValue?.length == typeSelectOptions.length || !modelValue?.length
        "
      >
        All
      </template>
    </template>
  </USelect>
</template>

<script setup lang="ts">
import type { SelectItem } from "@nuxt/ui";

const selectedTypes = defineModel<string[]>("types");

const typeSelectOptions: SelectItem[] = [
  {
    label: "Merged",
    value: "merged",
  },
  {
    label: "Original",
    value: "original",
  },
];
</script>
