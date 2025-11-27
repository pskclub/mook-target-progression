# Date Range Support Implementation

## Summary
Added date range filtering support to the ProjectDashboard Section component for filtering postponed schedules and postpone history.

## Changes Made

### 1. Component Props
Added optional `dateRange` prop to `ProjectDashboard/Section.vue`:

```typescript
const props = defineProps<{
  dateRange?: {
    start: string  // ISO date string
    end: string    // ISO date string
  }
}>()
```

### 2. Schedule Filtering
Updated `filteredSchedules` computed property to filter schedules by date range:

- Filters schedules where the schedule's date range overlaps with the provided filter range
- Uses overlap logic: `scheduleStart <= filterEnd && scheduleEnd >= filterStart`
- Returns all schedules if no date range is provided (backward compatible)

### 3. Postpone History Filtering
Updated `recentPostponeHistory` computed property to filter history entries by date range:

- Fixed bug: Changed from `history.date` to `history.start_date` and `history.end_date` (correct property names)
- Added date range filtering for individual history entries
- Filters history entries where the history's date range overlaps with the provided filter range
- Skips history entries that don't overlap with the filter range

### 4. Most Postponed Schedules
The `mostPostponedSchedules` computed property automatically benefits from the filtered schedules:

- Uses `filteredSchedules.value` which is already filtered by date range
- No additional changes needed

## Usage Example

### Basic Usage (No Date Range)
```vue
<template>
  <ProjectDashboardSection />
</template>
```

### With Date Range Filter
```vue
<template>
  <ProjectDashboardSection :date-range="dateRange" />
</template>

<script setup>
const dateRange = ref({
  start: '2024-01-01',
  end: '2024-12-31'
})
</script>
```

### Dynamic Date Range with Form
```vue
<template>
  <div>
    <!-- Date Range Picker -->
    <FormFields :options="dateRangeFields" />
    
    <!-- Dashboard with filtered data -->
    <ProjectDashboardSection :date-range="form.values.date_range" />
  </div>
</template>

<script setup>
const form = useForm({
  initialValues: {
    date_range: {
      start: new Date().toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  }
})

const dateRangeFields = createFormFields(() => [
  {
    type: INPUT_TYPES.DATE_RANGE,
    props: {
      label: 'ช่วงเวลา',
      name: 'date_range',
    }
  }
])
</script>
```

## Affected Components

### Directly Affected
- `mostPostponedSchedules` - Shows top 5 schedules with most postponements (filtered by date range)
- `recentPostponeHistory` - Shows latest 5 postpone history entries (filtered by date range)

### Indirectly Affected (via filteredSchedules)
- `stats.totalSchedules` - Count of schedules in date range
- `postponeStats` - Postpone statistics for schedules in date range

## Backward Compatibility
✅ Fully backward compatible - if no `dateRange` prop is provided, all schedules are shown (existing behavior)

## Testing Recommendations

1. **No Date Range**: Verify all schedules and history are shown
2. **With Date Range**: Verify only schedules/history within range are shown
3. **Overlapping Schedules**: Verify schedules that partially overlap with date range are included
4. **Edge Cases**: Test with schedules at exact start/end boundaries
5. **Empty Results**: Test with date range that has no matching schedules

