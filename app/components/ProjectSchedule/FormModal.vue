<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="modalTitle"
    description="Schedule info."
  >
    <template #body>
      <!-- View History Mode -->
      <div
        v-if="isViewHistory"
        class="space-y-4"
      >
        <div class="border-primary-200 bg-primary-50 rounded-lg border p-4">
          <p class="text-primary-800 mb-2 text-sm font-medium">
            ช่วงวันที่ปัจจุบัน: {{ TimeHelper.displayDate(values?.start_date) }}
            - {{ TimeHelper.displayDate(values?.end_date) }}
          </p>
          <p class="text-primary-600 text-sm">
            {{ values?.description || '-' }}
          </p>
        </div>

        <div
          v-if="values?.histories && values.histories.length > 0"
          class="space-y-3"
        >
          <p class="font-medium text-red-700">
            ประวัติการเลื่อนนัด ({{ values.histories.length }} ครั้ง)
          </p>
          <div
            v-for="(history, index) in values.histories"
            :key="index"
            class="rounded-lg border border-red-100 bg-red-50/50 p-3"
          >
            <p class="text-sm font-medium text-red-700">
              {{ TimeHelper.displayDate(history.start_date) }}  - {{ TimeHelper.displayDate(history.end_date) }}
            </p>
            <p class="text-xs text-red-500">
              {{ history.description || '-' }}
            </p>
          </div>
        </div>
        <div
          v-else
          class="text-center text-gray-500"
        >
          ไม่มีประวัติการเลื่อนนัด
        </div>
      </div>

      <!-- Edit/Add Mode -->
      <template v-else>
        <form @submit="onSubmit">
          <p
            v-if="values?.zones?.name"
            class="mb-2 text-lg font-semibold"
          >
            เขต: {{ values?.zones?.name }}
          </p>
          <p
            v-if="values?.customers?.name"
            class="mb-2 text-lg font-semibold"
          >
            ลูกค้า: {{ values?.customers?.name }}
          </p>
          <p
            v-if="values?.products?.name"
            class="mb-2 text-lg font-semibold"
          >
            สินค้า: {{ values?.products?.name }}
          </p>
          <FormFields :options="formFields" />
          <input
            type="submit"
            hidden
          />
        </form>
        <div
          v-if="!ArrayHelper.isEmpty(values?.histories)"
          class="my-6 border-gray-300"
        >
          <p class="mb-2 font-medium text-red-700">
            ประวัติการเลื่อนนัด ({{ values!.histories.length }} ครั้ง)
          </p>
          <div class="space-y-2">
            <div
              v-for="(history, index) in values!.histories"
              :key="index"
              class="rounded-lg border border-red-100 bg-red-50/50 p-3"
            >
              <p class="text-sm font-medium text-red-700">
                {{ TimeHelper.displayDate(history.start_date) }} - {{ TimeHelper.displayDate(history.end_date) }}
              </p>
              <p class="text-xs text-red-500">
                {{ history.description || '-' }}
              </p>
            </div>
          </div>
        </div>
      </template>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <Button
          variant="outline"
          color="neutral"
          @click="emits('close', false)"
        >
          {{ isViewHistory ? 'ปิด' : 'ยกเลิก' }}
        </Button>
        <template v-if="!isViewHistory">
          <Button
            v-if="isEditing"
            color="warning"
            :loading="status().isLoading"
            :disabled="!form.meta.value.dirty"
            @click="onPostponeSubmit"
          >
            เลื่อนนัด
          </Button>
          <Button
            :loading="status().isLoading"
            :disabled="!form.meta.value.dirty"
            @click="onSubmit"
          >
            {{ isEditing ? "บันทึก" : "เพิ่ม" }}
          </Button>
        </template>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
const emits = defineEmits<{ close: [boolean] }>()

const props = defineProps<{
  isEditing?: boolean
  isViewHistory?: boolean
  values?: IProjectSchedule
  projectId: string
  productId?: string
  customerId?: string

  status: () => IStatus
  onSubmit: (values: any) => void
}>()

const modalTitle = computed(() => {
  if (props.isViewHistory) return 'ประวัติกำหนดการ'

  return props.isEditing ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการ'
})

const customerLoader = useCustomerPageLoader()
const targetLoader = useProjectTargetLoader(props.projectId)
const dialog = useDialog()

const form = useForm({
  initialValues: props.values
    ? {
      ...props.values,
      date_range: {
        start: props.values.start_date,
        end: props.values.end_date,
      },
    }
    : {
      product_id: props.productId,
      customer_id: props.customerId,
    },
  validationSchema: toTypedSchema(v.object({
    date_range: v.optional(v.object({
      start: v.pipe(v.string(), v.nonEmpty('')),
      end: v.pipe(v.string(), v.nonEmpty('')),
    })),
    product_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
    customer_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
    description: v.optional(v.string(), ''),
  })),
})

const formFields = createFormFields(() => [
  {
    type: INPUT_TYPES.SELECT,
    isHide: props.isEditing,
    props: {
      label: 'สินค้า',
      name: 'product_id',
      disabled: true,
      required: true,
      options: targetLoader.fetch.items.map((item: any) => ({
        label: item.products?.name,
        value: item.product_id,
      })),
      loading: targetLoader.fetch.status.isLoading,
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    isHide: props.isEditing,
    props: {
      label: 'ลูกค้า',
      name: 'customer_id',
      disabled: true,
      required: true,
      options: customerLoader.fetch.items.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
      loading: customerLoader.fetch.status.isLoading,
    },
  },
  {
    type: INPUT_TYPES.DATE_RANGE,
    props: {
      label: 'เลือกช่วงเวลา',
      name: 'date_range',
      required: true,
    },
  },
  {
    type: INPUT_TYPES.TEXTAREA,
    props: {
      label: 'รายละเอียด',
      name: 'description',
      required: false,
    },
  },
])

const onSubmit = form.handleSubmit((values: any) => {
  // Always submit as a single record with start_date and end_date
  values.start_date = values.date_range.start
  values.end_date = values.date_range.end
  delete values.date_range

  props.onSubmit(values)
})

const onPostponeSubmit = form.handleSubmit((values: any) => {
  dialog.confirm({
    title: 'การเลื่อน',
    description: 'ต้องการเลื่อนกำหนดการนี้หรือไม่?',
    confirmText: 'เลื่อน',
    cancelText: 'ยกเลิก',
    type: DialogType.WARNING,
  }).then(() => {
    const payload = {
      ...values,
      start_date: values.date_range.start,
      end_date: values.date_range.end,
      histories: props.values!.histories.concat({
        start_date: props.values!.start_date,
        end_date: props.values!.end_date,
        description: props.values!.description,
      }),
    }

    delete payload.date_range

    props.onSubmit(payload)
  })
})

// Load data
targetLoader.fetchSetLoading()
customerLoader.fetchSetLoading()

onMounted(() => {
  targetLoader.fetchPage()
  customerLoader.fetchPage()
})
</script>
