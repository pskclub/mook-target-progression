<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไขโซน' : 'เพิ่มโซน'"
    description="รายละเอียดโซน"
  >
    <template #body>
      <form @submit="onSubmit">
        <FormFields :options="formFields" />
        <div class="mt-4">
          <label class="mb-1 block text-sm font-medium text-gray-700">จังหวัดที่อยู่ในโซน</label>
          <div class="grid h-64 grid-cols-2 gap-2 overflow-y-auto rounded-md border p-4 lg:grid-cols-3">
            <div
              v-for="province in provinces"
              :key="province.id"
              class="flex items-center gap-2"
            >
              <input
                :id="'prov-'+province.id"
                v-model="selectedProvinces"
                type="checkbox"
                :value="province.id"
                class="text-primary-600 rounded border-gray-300 shadow-sm focus:ring-primary-500"
              />
              <label
                :for="'prov-'+province.id"
                class="cursor-pointer text-sm"
              >{{ province.name_th }}</label>
            </div>
          </div>
        </div>
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
          :disabled="!form.meta.value.dirty && initialSelectedStr === currentSelectedStr"
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
  selectedIds?: number[]
  status: () => IStatus
  onSubmit: (values: any, selectedProvinces: number[]) => void
}>()

const form = useForm({
  initialValues: props.values,
  validationSchema: toTypedSchema(
    v.object({
      name: v.optional(v.pipe(v.string(), v.nonEmpty()), ''),
      color: v.optional(v.string(), ''),
    }),
  ),
})

const formFields = createFormFields(() => [
  {
    type: INPUT_TYPES.TEXT,
    props: {
      label: 'ชื่อโซน',
      name: 'name',
      required: true,
    },
  },
  {
    type: INPUT_TYPES.TEXT,
    props: {
      label: 'สีประจำโซน (เช่น #ff0000)',
      name: 'color',
    },
  },
])

const provinceStore = useProvincePageLoader()
const provinces = computed(() => provinceStore.fetch.items || [])
const selectedProvinces = ref<number[]>(props.selectedIds || [])
const initialSelectedStr = ref(JSON.stringify(props.selectedIds || []))
const currentSelectedStr = computed(() => JSON.stringify([...selectedProvinces.value].sort()))

const onSubmit = form.handleSubmit((values) => {
  props.onSubmit(values, selectedProvinces.value)
})

onMounted(() => {
  if (!provinces.value.length) {
    provinceStore.fetchPage()
  }
})
</script>
