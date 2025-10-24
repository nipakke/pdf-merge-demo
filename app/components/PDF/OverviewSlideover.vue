<template>
  <USlideover v-model:open="open" title="Edit PDF">
    <slot />

    <template #body>
      <div class="space-y-2">
        <div class="space-y-2">
          <div class="max-w-[80%] mx-auto select-none">
            <PDFViewCard :pdf="pdf" :show-name="false" />
          </div>

          <div class="text-sm italic text-center">
            <span class="">Uploaded:</span>
            {{ dayjs(pdf.createdAt).format("LLL") }}
          </div>
        </div>
        <USeparator />

        <UForm :schema="schema" :state="formState" @submit="onSubmit">
          <div class="space-y-2">
            <UFormField label="Name" name="name">
              <UInput v-model="formState.name" class="w-full" autofocus />
            </UFormField>
            <UButton
              type="submit"
              color="success"
              icon="lucide:save"
              class="justify-self-end"
            >
              Save
            </UButton>
          </div>
        </UForm>
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod/v4";
import type { LivePDF } from "~/lib/pdf/pdf";

type PropsWithPDF = {
  pdf: LivePDF;
};

const { pdf } = defineProps<PropsWithPDF>();
const pdfService = useService("pdf");

const schema = z.object({
  name: z.string().min(1).max(200),
});
type Schema = z.infer<typeof schema>;

const formState = reactive<Schema>({
  name: pdf.name,
});

const open = ref(false);
const emit = defineEmits(["close"]);

const toast = useToast();
async function onSubmit(event: FormSubmitEvent<Schema>) {
  await pdfService.edit({
    id: pdf.id,
    ...event.data,
  });

  emit("close");
  open.value = false;
  toast.add({
    title: "PDF Updated",
    description: `Name changed to "${event.data.name}"`,
    color: "success",
  });
}
</script>

<style scoped></style>
