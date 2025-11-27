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
            วันที่ปัจจุบัน: {{ TimeHelper.displayDate(values?.date) }}
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
              {{ TimeHelper.displayDate(history.date) }}
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
            ประวัติการเลื่อนนัด ({{ values.histories.length }} ครั้ง)
          </p>
          <div class="space-y-2">
            <div
              v-for="(history, index) in values!.histories"
              :key="index"
              class="rounded-lg border border-red-100 bg-red-50/50 p-3"
            >
              <p class="text-sm font-medium text-red-700">
                {{ TimeHelper.displayDate(history.date) }}
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
    ? props.values
    : {
      product_id: props.productId,
      customer_id: props.customerId,
    },
  validationSchema: props.values
    ? toTypedSchema(
      v.object({
        date: v.pipe(v.string(), v.nonEmpty('กรุณาระบุวันที่')),
        product_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
        customer_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
        description: v.optional(v.string(), ''),
      }),
    )
    : toTypedSchema(
      v.object({
        dates: v.pipe(v.object({
          start: v.union([v.date(), v.string()]),
          end: v.union([v.date(), v.string()]),
        })),
        product_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
        customer_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
        description: v.optional(v.string(), ''),
      }),
    ),
})

const formFields = createFormFields(() => [

  {
    type: INPUT_TYPES.SELECT,
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
    type: INPUT_TYPES.DATE,
    isHide: !props.isEditing,
    props: {
      label: 'วันที่',
      name: 'date',
      required: true,
    },
  },
  {
    type: INPUT_TYPES.DATE_RANGE,
    isHide: props.isEditing,
    props: {
      label: 'ช่วงวันที่',
      name: 'dates',
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
  if (values.dates) {
    const payloadItems = []

    for (let i = new Date(values.dates.start); i <= new Date(values.dates.end); i.setDate(i.getDate() + 1)) {
      const payload = {
        ...values,
        date: i.toISOString().split('T')[0],
      }

      delete payload.dates

      payloadItems.push(payload)
    }

    props.onSubmit(payloadItems)
  } else {
    props.onSubmit(values)
  }
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
      histories: props.values!.histories.concat({
        date: props.values!.date,
        description: props.values!.description,
      }),
    }

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
