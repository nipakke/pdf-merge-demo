<template>
  <NuxtRouteAnnouncer />
  <UApp :toaster="toaster">
    <NuxtLayout>
      <NuxtPage keepalive />
    </NuxtLayout>
  </UApp>
</template>


<script lang="ts" setup>
import type { ToasterProps } from "@nuxt/ui"
const toaster: ToasterProps = { position: "top-right" }



</script>