<template>
  <div>
    customers
  </div>
</template>

<script lang="ts" setup>
import { routes } from '~/constants/routes'

useHead({
  title: routes.customers.label,
})

useApp().definePage({
  title: routes.customers.label,
})
</script>

<style scoped>

</style>
