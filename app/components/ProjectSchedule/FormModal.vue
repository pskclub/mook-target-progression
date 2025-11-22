<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไขกำหนดการ' : 'เพิ่มกำหนดการ'"
    description="Schedule info."
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
  productId: string
  customerId: string

  status: () => IStatus
  onSubmit: (values: any) => void
}>()

const customerLoader = useCustomerPageLoader()
const targetLoader = useProjectTargetLoader(props.projectId)

const form = useForm({
  initialValues: props.values
    ? {
      ...props.values,
      date: props.values.date ? props.values.date.split('T')[0] : new Date().toISOString().split('T')[0],
    }
    : {
      date: new Date().toISOString().split('T')[0],
      product_id: props.productId,
      customer_id: props.customerId,
    },
  validationSchema: toTypedSchema(
    v.object({
      date: v.pipe(v.string(), v.nonEmpty('กรุณาระบุวันที่')),
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
    props: {
      label: 'วันที่',
      name: 'date',
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

const onSubmit = form.handleSubmit((values) => {
  props.onSubmit(values)
})

// Load data
targetLoader.fetchSetLoading()
customerLoader.fetchSetLoading()

onMounted(() => {
  targetLoader.fetchPage()
  customerLoader.fetchPage()
})
</script>
