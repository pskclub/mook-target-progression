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
            <template
              v-for="day in allDays"
              :key="day.key"
            >
              <!-- Gap Indicator -->
              <div
                v-if="day.isGap"
                class="flex w-10 shrink-0 flex-col items-center justify-center border-r border-gray-300 bg-gray-200 p-0.5 text-center"
                :title="`ข้าม ${day.gapDays} วัน`"
              >
                <Icon
                  name="ph:dots-three"
                  class="h-4 w-4 text-gray-400"
                />
                <div class="text-[8px] text-gray-500">
                  {{ day.gapDays }}d
                </div>
              </div>
              <!-- Normal Day -->
              <div
                v-else
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
            </template>
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
            <div class="flex items-center gap-1">
              <div class="text-sm">
                {{ row.zoneName }}
              </div>
              <p>•</p>
              <div
                class="truncate text-sm"
                :title="row.customerName"
              >
                {{ row.customerName }}
              </div>
            </div>
            <div
              class="truncate text-sm font-medium text-gray-500"
              :title="row.productName"
            >
              {{ row.productName }}
            </div>
          </div>

          <!-- Timeline Cells with Merged Items -->
          <div
            class="relative flex"
            :style="getRowContainerStyle(row.key)"
          >
            <!-- Background cells for borders -->
            <template
              v-for="day in allDays"
              :key="day.key"
            >
              <!-- Gap cell -->
              <div
                v-if="day.isGap"
                class="h-full w-10 shrink-0 border-r border-gray-300 bg-gray-100"
              />
              <!-- Normal day cell -->
              <div
                v-else
                class="h-full w-20 shrink-0 border-r border-gray-300"
                :class="getDayCellClass(day)"
              />
            </template>

            <!-- Merged Items (positioned absolutely) -->
            <div
              v-for="mergedItem in getMergedItemsForRow(row.key)"
              :key="mergedItem.id"
              class="group absolute top-0.5 z-[5] min-h-7 rounded px-1 py-0.5 text-xs leading-tight font-medium break-words whitespace-pre-line"
              :class="getMergedItemClass(mergedItem)"
              :style="getMergedItemStyle(mergedItem)"
              :title="getMergedItemTitle(mergedItem)"
              @click="onMergedItemClick(mergedItem)"
            >
              <div class="flex items-start justify-between gap-0.5">
                <span class="flex-1">
                  <span
                    v-if="mergedItem.isHistory"
                    class="mr-0.5"
                  >⏱</span>
                  {{ mergedItem.description || '✓' }}
                  <span
                    v-if="mergedItem.spanDays > 1"
                    class="ml-1 text-[9px] opacity-70"
                  >({{ mergedItem.spanDays }} วัน)</span>
                </span>
                <button
                  v-if="!mergedItem.isHistory && hasMergedItemHistories(mergedItem)"
                  color="warning"
                  :title="`ดูประวัติการเลื่อน`"
                  @click.stop="onMergedHistoryClick(mergedItem)"
                >
                  <Icon
                    name="ph:clock-counter-clockwise"
                    class="text-warning h-3 w-3 cursor-pointer"
                  />
                </button>
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
    <div class="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-600">
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
        <div class="border-error-300 bg-error-100 text-error flex h-4 w-4 items-center justify-center rounded border">
          ⏱
        </div>
        <span class="text-error">นัดที่ถูกเลื่อน</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="border-warning-300 bg-warning-100 flex h-4 w-4 items-center justify-center rounded border">
          <Icon
            name="ph:clock-counter-clockwise"
            class="text-warning h-3 w-3"
          />
        </div>
        <span class="text-warning">มีประวัติเลื่อนนัด</span>
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
  historyClick: [IProjectSchedule]
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
  isGap?: boolean
  gapDays?: number
  gapStartDate?: Date
  gapEndDate?: Date
}

interface CalendarItem {
  id: string
  startDate: string
  endDate: string
  description: string
  isHistory: boolean
  parentSchedule: IProjectSchedule
}

interface MergedCalendarItem {
  id: string
  startDate: Date
  endDate: Date
  description: string
  isHistory: boolean
  parentSchedules: IProjectSchedule[]
  spanDays: number
  stackIndex: number
}

interface TimelineRow {
  key: string
  productName: string
  customerName: string
  zoneName: string
  items: CalendarItem[]
}

interface MonthHeader {
  key: string
  label: string
  days: number
}

// Get all calendar items (schedules + histories)
const allCalendarItems = computed<CalendarItem[]>(() => {
  const items: CalendarItem[] = []

  props.schedules.forEach((schedule) => {
    // Add main schedule
    items.push({
      id: `schedule-${schedule.id}`,
      startDate: schedule.start_date,
      endDate: schedule.end_date,
      description: schedule.description,
      isHistory: false,
      parentSchedule: schedule,
    })

    // Add history items
    if (schedule.histories && schedule.histories.length > 0) {
      schedule.histories.forEach((history, index) => {
        items.push({
          id: `history-${schedule.id}-${index}`,
          startDate: history.start_date,
          endDate: history.end_date,
          description: history.description,
          isHistory: true,
          parentSchedule: schedule,
        })
      })
    }
  })

  return items
})

// Calculate date range from schedules (including histories)
const dateRange = computed(() => {
  if (allCalendarItems.value.length === 0) {
    const today = new Date()

    return {
      start: today,
      end: today,
    }
  }

  const dates = allCalendarItems.value.flatMap((item) => [
    new Date(item.startDate).getTime(),
    new Date(item.endDate).getTime(),
  ])

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

// Get all dates that have items
const datesWithItems = computed<Set<string>>(() => {
  const dates = new Set<string>()

  allCalendarItems.value.forEach((item) => {
    const startDate = new Date(item.startDate)
    const endDate = new Date(item.endDate)

    // Add all dates in the range
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)
    }
  })

  return dates
})

// Minimum gap size to collapse (in days)
const MIN_GAP_TO_COLLAPSE = 3

// Generate all days in the range with gap collapsing
const allDays = computed<TimelineDay[]>(() => {
  const {
    start, end,
  } = dateRange.value

  const today = new Date()
  const days: TimelineDay[] = []
  const itemDates = datesWithItems.value

  const current = new Date(start)

  while (current <= end) {
    const dayOfWeekIndex = current.getDay()
    const date = current.getDate()
    const month = current.getMonth()
    const year = current.getFullYear()
    const dateKey = `${year}-${month}-${date}`

    // Check if this date has items
    const hasItems = itemDates.has(dateKey)

    // Look ahead to find gap size if no items
    if (!hasItems) {
      let gapSize = 0
      const gapStart = new Date(current)
      const lookahead = new Date(current)

      while (lookahead <= end) {
        const laKey = `${lookahead.getFullYear()}-${lookahead.getMonth()}-${lookahead.getDate()}`
        if (itemDates.has(laKey)) break
        gapSize++
        lookahead.setDate(lookahead.getDate() + 1)
      }

      // If gap is large enough, collapse it
      if (gapSize >= MIN_GAP_TO_COLLAPSE) {
        const gapEnd = new Date(current)

        gapEnd.setDate(gapEnd.getDate() + gapSize - 1)

        days.push({
          key: `gap-${year}-${month}-${date}`,
          date: 0,
          month,
          year,
          dayOfWeek: '',
          isToday: false,
          isWeekend: false,
          isFirstOfMonth: false,
          fullDate: new Date(current),
          isGap: true,
          gapDays: gapSize,
          gapStartDate: gapStart,
          gapEndDate: gapEnd,
        })

        // Skip ahead past the gap
        current.setDate(current.getDate() + gapSize)
        continue
      }
    }

    // Normal day
    days.push({
      key: dateKey,
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

// Generate month headers (accounting for gaps)
const monthHeaders = computed<MonthHeader[]>(() => {
  const headers: MonthHeader[] = []
  let currentMonth = -1
  let currentYear = -1
  let dayCount = 0

  allDays.value.forEach((day, index) => {
    // Skip gap cells for month grouping, but count their visual width
    if (day.isGap) {
      // Gap spans multiple months potentially, just add to current
      dayCount += 0.5 // Half width for gap indicator

      if (index === allDays.value.length - 1 && headers.length > 0) {
        headers[headers.length - 1]!.days = dayCount
      }

      return
    }

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

// Helper to get pixel position for a date (accounting for gaps)
const getPixelPositionForDate = (date: Date): number => {
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  let position = 0

  for (const day of allDays.value) {
    const dayDate = new Date(day.fullDate.getFullYear(), day.fullDate.getMonth(), day.fullDate.getDate())

    // If this is a gap, check if target date falls within the gap
    if (day.isGap && day.gapEndDate) {
      const gapEnd = new Date(day.gapEndDate.getFullYear(), day.gapEndDate.getMonth(), day.gapEndDate.getDate())

      if (targetDate >= dayDate && targetDate <= gapEnd) {
        // Date is within a collapsed gap - position at start of gap
        return position
      }

      position += 40 // gap width
    } else {
      if (dayDate.getTime() === targetDate.getTime()) {
        return position
      }

      position += 80 // normal day width
    }
  }

  return position
}

// Helper to check if a date range spans a gap (for calculating visual span)
const getVisualSpanForDateRange = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
  let width = 0
  let started = false

  for (const day of allDays.value) {
    const dayDate = new Date(day.fullDate.getFullYear(), day.fullDate.getMonth(), day.fullDate.getDate())

    if (day.isGap && day.gapEndDate) {
      const gapEnd = new Date(day.gapEndDate.getFullYear(), day.gapEndDate.getMonth(), day.gapEndDate.getDate())

      // Check if our range intersects with this gap
      if (start <= gapEnd && end >= dayDate) {
        if (!started && start >= dayDate && start <= gapEnd) {
          started = true
        }

        if (started) {
          width += 40 // gap contributes fixed width
          if (end <= gapEnd) break
        }
      }
    } else {
      if (dayDate.getTime() === start.getTime()) {
        started = true
      }

      if (started) {
        width += 80
        if (dayDate.getTime() === end.getTime()) break
      }
    }
  }

  return width
}

// Group and merge calendar items by zone + customer + product + description with consecutive dates
const timelineRows = computed<TimelineRow[]>(() => {
  const rowMap = new Map<string, TimelineRow>()

  allCalendarItems.value.forEach((item) => {
    const schedule = item.parentSchedule
    const key = `${schedule.product_id}-${schedule.customer_id}`

    if (!rowMap.has(key)) {
      rowMap.set(key, {
        key,
        productName: schedule.products?.name || '-',
        customerName: schedule.customers?.name || '-',
        zoneName: schedule.zones?.name || '-',
        items: [],
      })
    }

    rowMap.get(key)!.items.push(item)
  })

  // Sort by zone name, then customer name, then product name
  return Array.from(rowMap.values()).sort((a, b) => {
    const zoneCompare = a.zoneName.localeCompare(b.zoneName, 'th')
    if (zoneCompare !== 0) return zoneCompare

    const customerCompare = a.customerName.localeCompare(b.customerName, 'th')
    if (customerCompare !== 0) return customerCompare

    return a.productName.localeCompare(b.productName, 'th')
  })
})

// Create merged items for each row
const getMergedItemsForRow = (rowKey: string): MergedCalendarItem[] => {
  const row = timelineRows.value.find((r) => r.key === rowKey)
  if (!row) return []

  // Group items by zone + customer + product + description + isHistory
  const groupMap = new Map<string, CalendarItem[]>()

  row.items.forEach((item) => {
    const schedule = item.parentSchedule
    const groupKey = `${schedule.zone_id}-${schedule.customer_id}-${schedule.product_id}-${item.description || ''}-${item.isHistory}`

    if (!groupMap.has(groupKey)) {
      groupMap.set(groupKey, [])
    }

    groupMap.get(groupKey)!.push(item)
  })

  const mergedItems: MergedCalendarItem[] = []

  groupMap.forEach((items) => {
    // Since we now have start_date and end_date, we don't need to merge consecutive dates
    // Just convert each item to a MergedCalendarItem
    items.forEach((item) => {
      const startDate = new Date(item.startDate)
      const endDate = new Date(item.endDate)
      const spanDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

      mergedItems.push({
        id: `merged-${item.id}`,
        startDate,
        endDate,
        description: item.description,
        isHistory: item.isHistory,
        parentSchedules: [item.parentSchedule],
        spanDays,
        stackIndex: 0, // Will be calculated later
      })
    })
  })

  // Sort by startDate then calculate stack indices for overlapping items
  const sortedMergedItems = mergedItems.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  // Calculate stack indices for overlapping items
  sortedMergedItems.forEach((item, index) => {
    const overlappingItems = sortedMergedItems.slice(0, index).filter((other) => {
      // Check if items overlap
      return other.endDate >= item.startDate && other.startDate <= item.endDate
    })

    // Find the lowest available stack index
    const usedIndices = overlappingItems.map((o) => o.stackIndex)
    let stackIndex = 0

    while (usedIndices.includes(stackIndex)) {
      stackIndex++
    }

    item.stackIndex = stackIndex
  })

  return sortedMergedItems
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

const hasHistories = (schedule: IProjectSchedule) => {
  return schedule.histories && schedule.histories.length > 0
}

const hasMergedItemHistories = (item: MergedCalendarItem) => {
  return item.parentSchedules.some((s) => hasHistories(s))
}

// Calculate row container height based on max stack index
const getRowContainerStyle = (rowKey: string) => {
  const mergedItems = getMergedItemsForRow(rowKey)

  if (mergedItems.length === 0) {
    return {
      minHeight: '32px',
    } // min-h-8 = 2rem = 32px
  }

  const maxStackIndex = Math.max(...mergedItems.map((i) => i.stackIndex))
  const itemHeight = 28 // min-h-7 = 1.75rem = 28px
  const rowHeight = 4 + (maxStackIndex + 1) * (itemHeight + 2) // padding + items

  return {
    minHeight: `${Math.max(32, rowHeight)}px`,
  }
}

// Style for merged items (position and width)
const getMergedItemStyle = (item: MergedCalendarItem) => {
  const itemHeight = 28 // min-h-7 = 1.75rem = 28px
  const left = getPixelPositionForDate(item.startDate) + 2 // +2 for padding
  const width = getVisualSpanForDateRange(item.startDate, item.endDate) - 4 // -4 for padding on both sides
  const top = 2 + item.stackIndex * (itemHeight + 2) // 2px initial offset + stacked items

  return {
    left: `${left}px`,
    width: `${Math.max(width, 20)}px`, // minimum width for visibility
    top: `${top}px`,
  }
}

const getMergedItemClass = (item: MergedCalendarItem) => {
  if (item.isHistory) {
    return 'bg-red-100 text-red-700 border border-red-300 cursor-default'
  }

  if (hasMergedItemHistories(item)) {
    return 'bg-warning-200 text-warning-700 hover:bg-warning/30 cursor-pointer border border-warning-300'
  }

  return 'bg-primary-200 text-primary hover:bg-primary-300 cursor-pointer'
}

const getMergedItemTitle = (item: MergedCalendarItem) => {
  const schedule = item.parentSchedules[0]!

  const dateRange = item.spanDays > 1
    ? ` (${item.startDate.toLocaleDateString('th-TH')} - ${item.endDate.toLocaleDateString('th-TH')})`
    : ''

  if (item.isHistory) {
    return `[ประวัติเลื่อน] ${schedule.products?.name} - ${schedule.customers?.name}${item.description ? ': ' + item.description : ''}${dateRange}`
  }

  const historyCount = item.parentSchedules.reduce((acc, s) => acc + (s.histories?.length || 0), 0)
  const historyText = historyCount > 0 ? ` (มีประวัติเลื่อน ${historyCount} ครั้ง)` : ''

  return `${schedule.products?.name} - ${schedule.customers?.name}${item.description ? ': ' + item.description : ''}${dateRange}${historyText}`
}

const onMergedItemClick = (item: MergedCalendarItem) => {
  if (item.isHistory) {
    emits('historyClick', item.parentSchedules[0]!)
  } else {
    // Click on first schedule in the group
    emits('scheduleClick', item.parentSchedules[0]!)
  }
}

const onMergedHistoryClick = (item: MergedCalendarItem) => {
  emits('historyClick', item.parentSchedules[0]!)
}
</script>
