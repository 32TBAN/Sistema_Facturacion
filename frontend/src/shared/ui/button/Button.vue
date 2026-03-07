<script setup lang="ts">
import { computed } from "vue";
import { buttonVariants, type ButtonVariants } from "./index";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariants["variant"];
    size?: ButtonVariants["size"];
    class?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
  }>(),
  {
    variant: "default",
    size: "default",
    type: "button",
    disabled: false,
  }
);

const classes = computed(() => cn(buttonVariants({ variant: props.variant, size: props.size }), props.class));
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>
