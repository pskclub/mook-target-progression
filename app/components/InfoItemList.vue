<template>
  <div
    :class="[
      'grid w-full gap-4',
      {
        'lg:grid-cols-2': !vertical,
      },
      customClass,
    ]"
  >
    <div
      v-for="item in items"
      :key="item.label"
      :class="[
        'lg:flex',
        {
          'flex-col': !inline,
          'flex-row': inline,
        },
        item.customClass,

      ]"
    >
      <template v-if="!item.hide">
        <p
          v-if="item.type !== TYPE_INFO_ITEM.BOOLEAN"
          :class="[
            'mb-1',
            {
              'mb-2 block text-sm font-bold text-black': !inline,
              'mr-2 font-bold': inline,
            },
          ]"
        >
          {{ item.label }}
        </p>
        <component
          :is="item.component"
          v-if="item.component"
          v-bind="item.props"
        />
        <slot
          v-else-if="item.key && $slots[`${item.key}-item`]"
          :name="`${item.key}-item`"
          :row="item"
          :item="item"
          :value="item.value"
          :label="item.label"
        />
        <div
          v-else
          class="break-words whitespace-pre-line text-gray-900"
        >
          <span
            v-if="shouldTruncateText(item)"
            v-show="!expandedItems[item.label]"
          >
            {{ truncateText(item.value || '-', item.max || 0) }}
            <button
              class="
              text-info-600 ml-1 cursor-pointer text-sm
              hover:text-info-800
            "
              @click="toggleExpanded(item.label)"
            >
              เพิ่มเติม
            </button>
          </span>
          <span
            v-if="shouldTruncateText(item)"
            v-show="expandedItems[item.label]"
          >
            {{ item.value || '-' }}
            <button
              class="
              text-info-600 ml-1 cursor-pointer text-sm
              hover:text-info-800
            "
              @click="toggleExpanded(item.label)"
            >
              แสดงน้อยลง
            </button>
          </span>
          <!-- <span >
          <Icon
            class="size-5"
            :class="item.value ? 'text-success' : 'text-error'"
            :name="item.value
              ? 'material-symbols:check-circle-outline-rounded'
              : 'material-symbols:cancel-outline-rounded'"
          />
        </span> -->
          <Checkbox
            v-if="item.type === TYPE_INFO_ITEM.BOOLEAN"
            v-model="item.value"
            :label="item.label"
            class="pointer-events-none"
          />
          <span v-else-if="!shouldTruncateText(item)">
            {{ getValue(item) }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue'

enum TYPE_INFO_ITEM {
  TEXT = 'text',
  NUMBER = 'number',
  CURRENCY = 'currency',
  DATE = 'date',
  DATE_TIME = 'date_time',
  BOOLEAN = 'boolean',
}

defineProps<{
  items: Array<{
    label: string
    value?: any
    component?: any
    props?: Record<string, any>
    max?: number
    key?: string
    type?: TYPE_INFO_ITEM
    customClass?: string
    hide?: boolean
  }>
  vertical?: boolean
  inline?: boolean
  customClass?: string

}>()

const expandedItems = reactive<Record<string, boolean>>({})

const shouldTruncateText = (item: any): boolean => {
  return item.max && item.value && item.value.length > item.max
}

const truncateText = (text: string, maxLength: number): string => {
  if (!maxLength || text.length <= maxLength) return text

  return text.slice(0, maxLength) + '...'
}

const toggleExpanded = (label: string): void => {
  expandedItems[label] = !expandedItems[label]
}

const getValue = (item: any): string => {
  if (item.type === TYPE_INFO_ITEM.DATE) {
    return item.value
      ? TimeHelper.displayDate(item.value) ?? '-'
      : '-'
  }

  if (item.type === TYPE_INFO_ITEM.DATE_TIME) {
    return item.value
      ? TimeHelper.displayDateTime(item.value) ?? '-'
      : '-'
  }

  if (item.value === undefined || item.value === null) {
    return '-'
  }

  if (typeof item.value === 'number') {
    if (item.type === 'currency') {
      return NumberHelper.toCurrency(item.value)
    }

    return NumberHelper.withFixed(item.value)
  }

  if (item.type === 'currency') {
    return NumberHelper.toCurrency(item.value)
  }

  if (item.type === 'number') {
    return NumberHelper.withFixed(item.value)
  }

  return item.value || '-'
}
</script>
