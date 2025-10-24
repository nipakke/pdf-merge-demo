<template>
  <div class="pb-20">
    <div>
      <UContainer>
        <div class="flex justify-center">
          <UNavigationMenu :items />
        </div>

        <ClientOnly>
          <StoredDisclaimer />
        </ClientOnly>
      </UContainer>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";

const items: NavigationMenuItem[] = [
  {
    label: "Merge",
    to: "/",
  },
  {
    label: "Library",
    to: "/library",
  },
];
</script>
