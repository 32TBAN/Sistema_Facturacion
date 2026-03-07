<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AuthLayout from "@/shared/layouts/AuthLayout.vue";
import AppShellLayout from "@/shared/layouts/AppShellLayout.vue";

const route = useRoute();

const layoutComponent = computed(() =>
  route.meta.layout === "app" ? AppShellLayout : AuthLayout
);
</script>
