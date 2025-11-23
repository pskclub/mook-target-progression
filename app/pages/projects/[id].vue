<template>
  <ProjectDetail />
</template>

<script lang="ts" setup>
import ProjectDetail from '~/features/ProjectDetail/index.vue'

useHead({
  title: 'กำลังโหลดโครงการ...',
})

useApp().definePage({
  title: 'กำลังโหลดโครงการ...',
})
</script>
