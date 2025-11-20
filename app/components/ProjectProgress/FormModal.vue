<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไขผลการดำเนินการ' : 'เพิ่มผลการดำเนินการ'"
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

  status: () => IStatus
  onSubmit: (values: any) => void
}>()

const productLoader = useProductsPageLoader()
const customerLoader = useCustomerPageLoader()

const form = useForm({
  initialValues: props.values,
  validationSchema: toTypedSchema(
    v.object({
      product_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
      customer_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
      status: v.optional(v.pipe(v.string(), v.nonEmpty()), 'PENDING'),
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
      options: productLoader.fetch.items.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: 'ลูกค้า',
      name: 'customer_id',
      required: true,
      options: customerLoader.fetch.items.map((item: any) => ({
        label: item.name,
        value: item.id,
      })),
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: 'สถานะ',
      name: 'status',
      required: true,
      options: [
        {
          label: 'ขาลง',
          value: 'PENDING',
        },
        {
          label: 'ขาขึ้น',
          value: 'APPROVED',
        },
        {
          label: 'ยกเลิก',
          value: 'REJECTED',
        },
      ],
    },
  },
])

const onSubmit = form.handleSubmit((values) => {
  props.onSubmit(values)
})

// Load data
productLoader.fetchSetLoading()
customerLoader.fetchSetLoading()

onMounted(() => {
  productLoader.fetchPage()
  customerLoader.fetchPage()
})
</script>
