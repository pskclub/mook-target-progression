<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="true"
    title="ปฏิทินกำหนดการ"
    description="แสดงกำหนดการในรูปแบบปฏิทิน"
    :ui="{
      content: 'max-w-4xl',
    }"
  >
    <template #body>
      <CalendarView
        :schedules="schedules"
        @scheduleClick="onScheduleClick"
      />
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import CalendarView from '~/components/ProjectSchedule/CalendarView.vue'
import type { IProjectSchedule } from '~/loaders/project-detail'

const emits = defineEmits<{ close: [boolean] }>()

defineProps<{
  schedules: IProjectSchedule[]
}>()

const onScheduleClick = (schedule: IProjectSchedule) => {
  // TODO: Show schedule details or edit modal
  console.log('Schedule clicked:', schedule)
}
</script>
