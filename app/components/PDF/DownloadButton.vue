<template>
  <UButton
    color="success"
    size="sm"
    icon="lucide:download"
    :download="downloadName"
    :href="objectUrl"
  />
</template>

<script setup lang="ts">
import { useObjectUrl } from "@vueuse/core";

type BlobProps = {
  blob: Blob;
  url?: never;
  name: string;
};

type Props = {
  blob?: never;
  url: string;
  name: string;
};

const props = defineProps<Props | BlobProps>();
const objectUrl: Ref<string | undefined> = props.url
  ? ref(props.url)
  : useObjectUrl(props.blob);

//remove .pdf from the name if exists
//because browser's add that based on the blob type
const downloadName = props.name.endsWith(".pdf")
  ? props.name.slice(0, -4)
  : props.name;
</script>
