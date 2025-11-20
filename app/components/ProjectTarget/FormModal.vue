<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไข Target' : 'เพิ่ม Target'"
    description="Target of Product info."
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

const form = useForm({
  initialValues: props.values,
  validationSchema: toTypedSchema(
    v.object({
      product_id: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
      amount: v.optional(v.pipe(v.number(), v.minValue(0)), 0),
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
    type: INPUT_TYPES.NUMBER,
    props: {
      label: 'จำนวน',
      name: 'amount',
      required: true,
    },
  },
])

const onSubmit = form.handleSubmit((values) => {
  props.onSubmit(values)
})

// Load products
productLoader.fetchSetLoading()
onMounted(() => {
  productLoader.fetchPage()
})
</script>
