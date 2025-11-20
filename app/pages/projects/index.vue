<template>
  <div>
    projects
  </div>
</template>

<script lang="ts" setup>
import { routes } from '~/constants/routes'

useHead({
  title: routes.projects.label,
})

useApp().definePage({
  title: routes.projects.label,
})
</script>

<style scoped>

</style>
