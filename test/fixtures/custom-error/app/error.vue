<template>
  <h1 class="error">
    {{ error.statusCode }}
  </h1>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()
</script>
