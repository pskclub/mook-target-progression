<template>
  <Button
    icon="ph:caret-left"
    variant="outline"
    color="neutral"
    :to="to"
    @click="$emit('click')"
  >
    {{ label || 'กลับ' }}
  </Button>
</template>

<script lang="ts" setup>
defineEmits<{
  (e: 'click'): void
}>()

defineProps<{
  to?: string
  label?: string
}>()
</script>
