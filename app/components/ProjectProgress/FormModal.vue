<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไขการดำเนินการ' : 'เพิ่มการดำเนินการ'"
    description="Project Progress info."
  >
    <template #body>
      <form @submit="onSubmit">
        <FormFields :options="formFields" />
        <input
          type="submit"
          hidden
        />
      </form>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-3">
        <Button
          variant="outline"
          color="neutral"
          @click="emits('close', false)"
        >
          ยกเลิก
        </Button>
        <Button
          :loading="status().isLoading"
          :disabled="!form.meta.value.dirty"
          @click="onSubmit"
        >
          {{ isEditing ? "บันทึก" : "เพิ่ม" }}
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
const emits = defineEmits<{ close: [boolean] }>()

const props = defineProps<{
  isEditing?: boolean
  values?: any
  projectId: string
  zoneId: string

  status: () => IStatus
  onSubmit: (values: any) => void
}>()

const targetLoader = useProjectTargetLoader(props.projectId)
const customerLoader = useCustomerPageLoader()

const form = useForm({
  initialValues: props.values,
  validationSchema: toTypedSchema(
    v.object({
      product_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
      customer_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
      status: v.optional(v.pipe(v.string(), v.nonEmpty()), 'PENDING'),
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
      required: true,
      disabled: props.isEditing,
      options: targetLoader.fetch.items.map((item) => ({
        label: item.products?.name,
        value: item.products?.id,
      })),
      loading: targetLoader.fetch.status.isLoading,
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: 'ลูกค้า',
      name: 'customer_id',
      required: true,
      disabled: props.isEditing,
      options: customerLoader.fetch.items.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      loading: customerLoader.fetch.status.isLoading,
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: 'สถานะ',
      name: 'status',
      required: true,
      options: statusOptions,
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

const onSubmit = form.handleSubmit((values) => {
  props.onSubmit(values)
})

// Load data
targetLoader.fetchSetLoading()
customerLoader.fetchSetLoading()

onMounted(() => {
  customerLoader.fetchPage()
  targetLoader.fetchPage(1, '', {
    params: {
      project_id: props.projectId,
    },
  })
})
</script>
