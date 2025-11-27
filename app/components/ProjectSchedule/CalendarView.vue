<template>
  <div class="overflow-hidden">
    <!-- Timeline Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-lg font-semibold">
        {{ dateRangeText }}
      </h3>
      <div class="text-sm text-gray-500">
        {{ schedules.length }} กำหนดการ
      </div>
    </div>

    <!-- Timeline Grid -->
    <div
      ref="scrollContainer"
      class="overflow-x-auto"
    >
      <div class="min-w-max ring-1 ring-gray-300">
        <!-- Month Headers -->
        <div class="sticky top-0 z-20 flex border-b border-gray-300">
          <div class="sticky left-0 z-30 w-52 shrink-0 border-r border-gray-300 bg-gray-100 p-2 text-sm font-semibold">
            เดือน
          </div>
          <div class="flex">
            <div
              v-for="month in monthHeaders"
              :key="month.key"
              class="shrink-0 border-r border-gray-300 bg-gray-100 px-2 py-1 text-center text-xs font-semibold"
              :style="{ width: `${month.days * 80}px` }"
            >
              {{ month.label }}
            </div>
          </div>
        </div>

        <!-- Date Headers -->
        <div class="sticky top-[37px] z-20 flex border-b border-gray-300">
          <div class="sticky left-0 z-30 w-52 shrink-0 border-r border-gray-300 bg-gray-50 p-2 text-sm font-semibold">
            สินค้า / ลูกค้า
          </div>
          <div class="flex">
            <div
              v-for="day in allDays"
              :key="day.key"
              class="w-20 shrink-0 border-r border-gray-300 p-0.5 text-center text-xs"
              :class="getDayHeaderClass(day)"
            >
              <div class="text-[10px] text-gray-400">
                {{ day.dayOfWeek }}
              </div>
              <div
                class="mx-auto flex h-5 w-5 items-center justify-center text-[11px]"
                :class="day.isToday ? 'bg-primary rounded-full text-white' : ''"
              >
                {{ day.date }}
              </div>
            </div>
          </div>
        </div>

        <!-- Product/Customer Rows -->
        <div
          v-for="row in timelineRows"
          :key="row.key"
          class="flex border-b border-gray-300 hover:bg-gray-50/50"
        >
          <!-- Row Label -->
          <div class="sticky left-0 z-10 w-52 shrink-0 border-r border-gray-300 bg-white p-2">
            <div
              class="truncate text-sm font-medium"
              :title="row.productName"
            >
              {{ row.productName }}
            </div>
            <div
              class="truncate text-xs text-gray-500"
              :title="row.customerName"
            >
              {{ row.customerName }}
            </div>
          </div>

          <!-- Timeline Cells -->
          <div class="flex">
            <div
              v-for="day in allDays"
              :key="day.key"
              class="w-20 shrink-0 border-r border-gray-300 p-0.5"
              :class="getDayCellClass(day)"
            >
              <div
                v-for="schedule in getSchedulesForRowAndDate(row.key, day.fullDate)"
                :key="schedule.id"
                class="min-h-7 w-full cursor-pointer rounded px-1 py-0.5 text-[10px] leading-tight font-medium break-words whitespace-pre-line"
                :class="getScheduleClass(schedule)"
                :title="`${schedule.products?.name} - ${schedule.customers?.name}${schedule.description ? ': ' + schedule.description : ''}`"
                @click="onScheduleClick(schedule)"
              >
                {{ schedule.description || '✓' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="timelineRows.length === 0"
          class="flex items-center justify-center py-12 text-gray-500"
        >
          ไม่มีกำหนดการ
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="mt-4 flex items-center gap-4 text-xs text-gray-600">
      <div class="flex items-center gap-1">
        <div class="bg-primary/20 flex h-4 w-4 items-center justify-center rounded">
          <Icon
            name="ph:check-circle-fill"
            class="text-primary h-3 w-3"
          />
        </div>
        <span>มีกำหนดการ</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="bg-primary flex h-5 w-5 items-center justify-center rounded-full text-[11px] text-white">
          {{ new Date().getDate() }}
        </div>
        <span>วันนี้</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { IProjectSchedule } from '~/loaders/project-detail'

const emits = defineEmits<{
  scheduleClick: [IProjectSchedule]
}>()

const props = defineProps<{
  schedules: IProjectSchedule[]
}>()

const scrollContainer = ref<HTMLElement | null>(null)
const dayOfWeekNames: string[] = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']
const monthNames: string[] = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]

interface TimelineDay {
  key: string
  date: number
  month: number
  year: number
  dayOfWeek: string
  isToday: boolean
  isWeekend: boolean
  isFirstOfMonth: boolean
  fullDate: Date
}

interface TimelineRow {
  key: string
  productName: string
  customerName: string
  schedules: IProjectSchedule[]
}

interface MonthHeader {
  key: string
  label: string
  days: number
}

// Calculate date range from schedules
const dateRange = computed(() => {
  if (props.schedules.length === 0) {
    const today = new Date()

    return {
      start: today,
      end: today,
    }
  }

  const dates = props.schedules.map((s) => new Date(s.date).getTime())
  const minDate = new Date(Math.min(...dates))
  const maxDate = new Date(Math.max(...dates))

  // Use exact schedule dates (not full months)
  const start = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())
  const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())

  return {
    start,
    end,
  }
})

const dateRangeText = computed(() => {
  const {
    start, end,
  } = dateRange.value

  const startText = start.toLocaleDateString('th-TH', {
    month: 'short',
    year: 'numeric',
  })

  const endText = end.toLocaleDateString('th-TH', {
    month: 'short',
    year: 'numeric',
  })

  if (startText === endText) return startText

  return `${startText} - ${endText}`
})

// Generate all days in the range
const allDays = computed<TimelineDay[]>(() => {
  const {
    start, end,
  } = dateRange.value

  const today = new Date()
  const days: TimelineDay[] = []

  const current = new Date(start)

  while (current <= end) {
    const dayOfWeekIndex = current.getDay()
    const date = current.getDate()
    const month = current.getMonth()
    const year = current.getFullYear()

    days.push({
      key: `${year}-${month}-${date}`,
      date,
      month,
      year,
      dayOfWeek: dayOfWeekNames[dayOfWeekIndex] ?? '',
      isToday:
        today.getDate() === date
        && today.getMonth() === month
        && today.getFullYear() === year,
      isWeekend: dayOfWeekIndex === 0 || dayOfWeekIndex === 6,
      isFirstOfMonth: date === 1,
      fullDate: new Date(current),
    })

    current.setDate(current.getDate() + 1)
  }

  return days
})

// Generate month headers
const monthHeaders = computed<MonthHeader[]>(() => {
  const headers: MonthHeader[] = []
  let currentMonth = -1
  let currentYear = -1
  let dayCount = 0

  allDays.value.forEach((day, index) => {
    if (day.month !== currentMonth || day.year !== currentYear) {
      if (dayCount > 0 && headers.length > 0) {
        headers[headers.length - 1]!.days = dayCount
      }

      currentMonth = day.month
      currentYear = day.year
      headers.push({
        key: `${day.year}-${day.month}`,
        label: `${monthNames[day.month] ?? ''} ${day.year + 543}`,
        days: 0,
      })

      dayCount = 1
    } else {
      dayCount++
    }

    // Last day
    if (index === allDays.value.length - 1 && headers.length > 0) {
      headers[headers.length - 1]!.days = dayCount
    }
  })

  return headers
})

// Group schedules by product + customer combination (all schedules)
const timelineRows = computed<TimelineRow[]>(() => {
  const rowMap = new Map<string, TimelineRow>()

  props.schedules.forEach((schedule) => {
    const key = `${schedule.product_id}-${schedule.customer_id}`

    if (!rowMap.has(key)) {
      rowMap.set(key, {
        key,
        productName: schedule.products?.name || '-',
        customerName: schedule.customers?.name || '-',
        schedules: [],
      })
    }

    rowMap.get(key)!.schedules.push(schedule)
  })

  // Sort by product name, then customer name
  return Array.from(rowMap.values()).sort((a, b) => {
    const productCompare = a.productName.localeCompare(b.productName, 'th')
    if (productCompare !== 0) return productCompare

    return a.customerName.localeCompare(b.customerName, 'th')
  })
})

const getSchedulesForRowAndDate = (
  rowKey: string,
  date: Date,
): IProjectSchedule[] => {
  const row = timelineRows.value.find((r) => r.key === rowKey)
  if (!row) return []

  return row.schedules.filter((schedule) => {
    const scheduleDate = new Date(schedule.date)

    return (
      scheduleDate.getDate() === date.getDate()
      && scheduleDate.getMonth() === date.getMonth()
      && scheduleDate.getFullYear() === date.getFullYear()
    )
  })
}

const getDayHeaderClass = (day: TimelineDay) => {
  if (day.isWeekend) return 'bg-gray-100'

  return 'bg-gray-50'
}

const getDayCellClass = (day: TimelineDay) => {
  const classes: string[] = []
  if (day.isWeekend) classes.push('bg-gray-50')
  if (day.isFirstOfMonth) classes.push('border-l-2 border-l-gray-300')

  return classes.join(' ')
}

const getScheduleClass = (_schedule: IProjectSchedule) => {
  return 'bg-primary/20 text-primary hover:bg-primary/30'
}

const onScheduleClick = (schedule: IProjectSchedule) => {
  emits('scheduleClick', schedule)
}
</script>
