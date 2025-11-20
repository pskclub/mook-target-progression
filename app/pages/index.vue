<template>
  <div>
    dashboard
  </div>
</template>

<script lang="ts" setup>
import { routes } from '~/constants/routes'

useHead({
  title: routes.dashboard.label,
})

useApp().definePage({
  title: routes.dashboard.label,
})
</script>
