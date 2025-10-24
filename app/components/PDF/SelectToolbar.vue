<template>
  <div class="justify-center flex gap-2">
    <UButton variant="ghost" icon="lucide:circle-check-big" @click="selectAll()">
      Select all
    </UButton>
    <UButton variant="ghost" icon="lucide:circle-minus" @click="unselectAll()">
      Unselect all
    </UButton>
    <UButton variant="ghost" icon="gg:drop-invert" @click="invertSelection()">
      Invert selection
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { LivePDF } from '~/lib/pdf/pdf';

const selected = defineModel<Set<string>>("selected", {
  default: new Set()
})

const props = defineProps<{
  pdfs: LivePDF[]
}>()

const pdfs = computed(() => props.pdfs)

function selectAll() {
  selected.value = new Set(pdfs.value.map(t => t.id))
}
function unselectAll() {
  selected.value.clear()
}

function invertSelection() {
  const newSelection = pdfs.value.map(t => t.id).filter(id => !selected.value.has(id))
  selected.value = new Set(newSelection)
}



</script>

<style scoped></style>