<template>
  <Button
    size="lg"
    variant="ghost"
    :icon="icon"
    :color="color"
    square
    :disabled="disabled"
    :loading="loading"
    :to="to"
    @click="$emit('click')"
  />
</template>

<script lang="ts" setup>
defineEmits<{
  (e: 'click'): void
}>()

withDefaults(defineProps<{
  to?: string
  icon: string
  color?: 'neutral' | 'error' | 'primary' | 'success' | 'warning' | 'info'
  disabled?: boolean
  loading?: boolean
}>(), {
  color: 'neutral',
})
</script>
