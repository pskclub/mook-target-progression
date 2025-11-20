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
      <div class="p-4">
        <!-- Calendar Header -->
        <div class="mb-4 flex items-center justify-between">
          <Button
            icon="ph:caret-left"
            variant="ghost"
            @click="previousMonth"
          >
            เดือนก่อน
          </Button>
          <h3 class="text-lg font-semibold">
            {{ currentMonthYear }}
          </h3>
          <Button
            trailing-icon="ph:caret-right"
            variant="ghost"
            @click="nextMonth"
          >
            เดือนถัดไป
          </Button>
        </div>

        <!-- Calendar Grid -->
        <div class="grid grid-cols-7 gap-2">
          <!-- Day Headers -->
          <div
            v-for="day in dayHeaders"
            :key="day"
            class="p-2 text-center text-sm font-semibold text-gray-600"
          >
            {{ day }}
          </div>

          <!-- Calendar Days -->
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            class="min-h-[100px] rounded-lg border p-2"
            :class="getDayClass(day)"
          >
            <div class="mb-1 text-sm font-medium">
              {{ day.date }}
            </div>
            <div
              v-if="day.schedules.length > 0"
              class="space-y-1"
            >
              <div
                v-for="schedule in day.schedules"
                :key="schedule.id"
                class="bg-primary/10 cursor-pointer rounded px-2 py-1 text-xs hover:bg-primary/20"
                @click="onScheduleClick(schedule)"
              >
                <div class="font-medium">
                  {{ schedule.products?.name }}
                </div>
                <div class="text-gray-600">
                  {{ schedule.customers?.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import type { IProjectSchedule } from '~/loaders/project-detail'

const emits = defineEmits<{ close: [boolean] }>()

const props = defineProps<{
  schedules: IProjectSchedule[]
}>()

const currentDate = ref(new Date())

const dayHeaders = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
  })
})

interface CalendarDay {
  date: number
  isCurrentMonth: boolean
  schedules: IProjectSchedule[]
  fullDate: Date
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days: CalendarDay[] = []

  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const date = prevMonthLastDay - i
    const fullDate = new Date(year, month - 1, date)

    days.push({
      date,
      isCurrentMonth: false,
      schedules: getSchedulesForDate(fullDate),
      fullDate,
    })
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = new Date(year, month, i)

    days.push({
      date: i,
      isCurrentMonth: true,
      schedules: getSchedulesForDate(fullDate),
      fullDate,
    })
  }

  // Next month days
  const remainingDays = 42 - days.length // 6 weeks * 7 days

  for (let i = 1; i <= remainingDays; i++) {
    const fullDate = new Date(year, month + 1, i)

    days.push({
      date: i,
      isCurrentMonth: false,
      schedules: getSchedulesForDate(fullDate),
      fullDate,
    })
  }

  return days
})

const getSchedulesForDate = (date: Date): IProjectSchedule[] => {
  return props.schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date)

    return (
      scheduleDate.getDate() === date.getDate()
      && scheduleDate.getMonth() === date.getMonth()
      && scheduleDate.getFullYear() === date.getFullYear()
    )
  })
}

const getDayClass = (day: CalendarDay) => {
  const classes = []

  if (!day.isCurrentMonth) {
    classes.push('bg-gray-50 text-gray-400')
  } else {
    classes.push('bg-white')
  }

  const today = new Date()

  if (
    day.fullDate.getDate() === today.getDate()
    && day.fullDate.getMonth() === today.getMonth()
    && day.fullDate.getFullYear() === today.getFullYear()
  ) {
    classes.push('border-primary border-2')
  }

  return classes.join(' ')
}

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1,
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1,
  )
}

const onScheduleClick = (schedule: IProjectSchedule) => {
  // TODO: Show schedule details or edit modal
  console.log('Schedule clicked:', schedule)
}
</script>
