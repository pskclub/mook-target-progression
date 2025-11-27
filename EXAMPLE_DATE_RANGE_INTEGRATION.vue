<template>
  <div class="space-y-6">
    <!-- Date Range Filter Section -->
    <Card>
      <div class="p-4">
        <h3 class="mb-4 text-lg font-bold">
          กรองข้อมูลตามช่วงเวลา
        </h3>
        <div class="flex items-end gap-4">
          <FormFields :options="filterFields" />
          <Button
            variant="outline"
            @click="clearDateRange"
          >
            ล้างตัวกรอง
          </Button>
        </div>
      </div>
    </Card>

    <!-- Dashboard with Date Range Filter -->
    <ProjectDashboardSection :date-range="form.values.date_range" />
  </div>
</template>

<script lang="ts" setup>
import ProjectDashboardSection from '~/components/ProjectDashboard/Section.vue'
import { INPUT_TYPES } from '~/constants/config'

// Form for date range filter
const form = useForm({
  initialValues: {
    date_range: undefined as { start: string; end: string } | undefined,
  },
})

// Form fields configuration
const filterFields = createFormFields(() => [
  {
    type: INPUT_TYPES.DATE_RANGE,
    props: {
      label: 'เลือกช่วงเวลา',
      name: 'date_range',
      placeholder: 'เลือกช่วงวันที่...',
    },
  },
])

// Clear date range filter
const clearDateRange = () => {
  form.setFieldValue('date_range', undefined)
}

// Watch for date range changes (optional - for debugging)
watch(() => form.values.date_range, (newRange) => {
  if (newRange) {
    console.log('Date range changed:', {
      start: newRange.start,
      end: newRange.end,
    })
  } else {
    console.log('Date range cleared - showing all data')
  }
})
</script>

<!-- 
ALTERNATIVE IMPLEMENTATION: Quick Date Range Presets
-->

<template>
  <div class="space-y-6">
    <!-- Quick Date Range Presets -->
    <Card>
      <div class="p-4">
        <h3 class="mb-4 text-lg font-bold">
          ช่วงเวลา
        </h3>
        <div class="flex flex-wrap gap-2">
          <Button
            size="sm"
            :variant="!selectedPreset ? 'solid' : 'outline'"
            @click="setDateRange(null)"
          >
            ทั้งหมด
          </Button>
          <Button
            size="sm"
            :variant="selectedPreset === 'today' ? 'solid' : 'outline'"
            @click="setDateRange('today')"
          >
            วันนี้
          </Button>
          <Button
            size="sm"
            :variant="selectedPreset === 'week' ? 'solid' : 'outline'"
            @click="setDateRange('week')"
          >
            สัปดาห์นี้
          </Button>
          <Button
            size="sm"
            :variant="selectedPreset === 'month' ? 'solid' : 'outline'"
            @click="setDateRange('month')"
          >
            เดือนนี้
          </Button>
          <Button
            size="sm"
            :variant="selectedPreset === 'quarter' ? 'solid' : 'outline'"
            @click="setDateRange('quarter')"
          >
            ไตรมาสนี้
          </Button>
          <Button
            size="sm"
            :variant="selectedPreset === 'year' ? 'solid' : 'outline'"
            @click="setDateRange('year')"
          >
            ปีนี้
          </Button>
        </div>
      </div>
    </Card>

    <!-- Dashboard -->
    <ProjectDashboardSection :date-range="dateRange" />
  </div>
</template>

<script lang="ts" setup>
import ProjectDashboardSection from '~/components/ProjectDashboard/Section.vue'

const selectedPreset = ref<string | null>(null)
const dateRange = ref<{ start: string; end: string } | undefined>(undefined)

const setDateRange = (preset: string | null) => {
  selectedPreset.value = preset
  
  if (!preset) {
    dateRange.value = undefined
    return
  }

  const today = new Date()
  const start = new Date()
  const end = new Date()

  switch (preset) {
    case 'today':
      // Today only
      break
    case 'week':
      // Start of week (Monday)
      start.setDate(today.getDate() - today.getDay() + 1)
      end.setDate(start.getDate() + 6)
      break
    case 'month':
      // Start of month
      start.setDate(1)
      end.setMonth(end.getMonth() + 1, 0)
      break
    case 'quarter':
      // Start of quarter
      const quarter = Math.floor(today.getMonth() / 3)
      start.setMonth(quarter * 3, 1)
      end.setMonth(quarter * 3 + 3, 0)
      break
    case 'year':
      // Start of year
      start.setMonth(0, 1)
      end.setMonth(11, 31)
      break
  }

  dateRange.value = {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
</script>

