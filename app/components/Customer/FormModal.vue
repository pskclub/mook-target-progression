<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไข Customer' : 'เพิ่ม Customer'"
    description="Customer info."
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

const provinceStore = useProvincePageLoader()
const provinces = computed(() => provinceStore.fetch.items || [])

const form = useForm({
  initialValues: props.values,
  validationSchema: toTypedSchema(
    v.object({
      name: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
      province_id: v.optional(v.number(), undefined),
    }),
  ),
})

const formFields = createFormFields(() => [
  {
    type: INPUT_TYPES.TEXT,
    props: {
      label: 'ชื่อ',
      name: 'name',
      required: true,
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: 'จังหวัด',
      name: 'province_id',
      options: provinces.value.map((p) => ({
        label: p.name_th,
        value: p.id,
      })),
      placeholder: 'เลือกจังหวัด',
    },
  },
])

onMounted(() => {
  if (!provinces.value.length) {
    provinceStore.fetchPage()
  }
})

const onSubmit = form.handleSubmit((values) => {
  props.onSubmit(values)
})
</script>
