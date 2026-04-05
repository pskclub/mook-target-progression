<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไขการดำเนินการ' : 'เพิ่มการดำเนินการ'"
    description="Project Progress info."
    :ui="{
      content: isEditing ? undefined : 'max-w-2xl',
    }"
  >
    <template #body>
      <form @submit="onSubmit">
        <template v-if="isEditing">
          <FormFields :options="formFields" />
        </template>
        <template v-else>
          <!-- Step 1: เลือกลูกค้า + สินค้า -->
          <div class="mb-6 rounded-md border border-gray-200 p-4">
            <FormFields :options="topFields" />
          </div>

          <!-- Step 2: กรอกรายละเอียดต่อสินค้า -->
          <div
            v-if="fields.length > 0"
            class="space-y-4"
          >
            <div
              v-for="(field, index) in fields"
              :key="field.key"
              class="relative rounded-md border border-gray-200 p-4 pt-10"
            >
              <div class="absolute top-3 left-4 text-sm font-bold text-gray-700">
                {{ getProductName((field.value as any).product_id) }}
              </div>
              <FormFields :options="(getItemFormFields(index) as any)" />
            </div>
          </div>

          <div
            v-else
            class="py-6 text-center text-sm text-gray-400"
          >
            เลือกสินค้าด้านบนเพื่อกรอกรายละเอียด
          </div>
        </template>
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
import { useFieldArray } from 'vee-validate'

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
const zoneLoader = useZonePageLoader()
const project = useProjectsPageLoader()

// Existing product+customer pairs in this zone (to prevent duplicates)
const existingZonePairs = computed(() => {
  return new Set(
    (project.find.item?.project_progresses ?? [])
      .filter((p) => p.zone_id === props.zoneId)
      .map((p) => `${p.product_id}|${p.customer_id}`),
  )
})

const isDuplicate = (productId: string, customerId: string) =>
  existingZonePairs.value.has(`${productId}|${customerId}`)

const filteredCustomers = computed(() => {
  const zone = zoneLoader.fetch.items.find((z) => z.id === props.zoneId)
  const zoneProvinceIds = zone?.provinces?.map((p) => p.id) ?? []

  return customerLoader.fetch.items.filter((customer) => {
    const provinceName = customer.provinces?.name_th ?? ''
    if (provinceName.includes('กรุงเทพ')) return true
    if (!customer.province_id) return false

    return zoneProvinceIds.includes(customer.province_id)
  })
})

const schemaObj = props.isEditing
  ? v.object({
    product_id: v.optional(v.pipe(v.string(), v.nonEmpty('กรุณาเลือกสินค้า')), ''),
    customer_id: v.optional(v.pipe(v.string(), v.nonEmpty('กรุณาเลือกลูกค้า')), ''),
    status: v.optional(v.pipe(v.string(), v.nonEmpty()), 'PENDING'),
    description: v.optional(v.string(), ''),
  })
  : v.object({
    customer_id: v.pipe(v.string(), v.nonEmpty('กรุณาเลือกลูกค้า')),
    product_ids: v.pipe(v.array(v.string()), v.minLength(1, 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการ')),
    items: v.array(
      v.object({
        product_id: v.string(),
        status: v.optional(v.string(), 'PENDING'),
        description: v.optional(v.string(), ''),
      }),
    ),
  })

const form = useForm({
  initialValues: props.isEditing
    ? props.values
    : {
      customer_id: '',
      product_ids: [] as string[],
      items: [] as { product_id: string
        status: string
        description: string }[],
    },
  validationSchema: toTypedSchema(schemaObj),
})

const {
  fields, push, remove,
} = useFieldArray('items')

// Sync items array when product_ids selection changes
watch(
  () => (form.values as any).product_ids as string[] | undefined,
  (newIds = []) => {
    const currentIds = fields.value.map((f) => (f.value as any).product_id as string)

    // Add newly selected products
    newIds.forEach((id) => {
      if (!currentIds.includes(id)) {
        push({
          product_id: id,
          status: 'PENDING',
          description: '',
        })
      }
    })

    // Remove deselected products (backwards to preserve indices)
    for (let i = fields.value.length - 1; i >= 0; i--) {
      if (!newIds.includes((fields.value[i].value as any).product_id)) {
        remove(i)
      }
    }
  },
  {
    deep: true,
  },
)

// De-select products that become duplicates when customer changes
watch(
  () => (form.values as any).customer_id as string | undefined,
  (newCustomerId) => {
    if (!newCustomerId) return
    const currentProductIds: string[] = (form.values as any).product_ids ?? []
    const validIds = currentProductIds.filter((pid) => !isDuplicate(pid, newCustomerId))

    if (validIds.length !== currentProductIds.length) {
      form.setFieldValue('product_ids' as any, validIds)
    }
  },
)

const getProductName = (productId: string) => {
  const item = targetLoader.fetch.items.find((i) => i.products?.id === productId)

  return item?.products?.name ?? productId
}

const topFields = createFormFields(() => [
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: 'ลูกค้า',
      name: 'customer_id',
      required: true,
      options: filteredCustomers.value.map((item) => ({
        label: item.name,
        value: item.id,
      })),
      loading: customerLoader.fetch.status.isLoading,
    },
  },
  {
    type: INPUT_TYPES.SELECT_MULTIPLE,
    props: {
      label: 'สินค้า',
      name: 'product_ids',
      required: true,
      options: targetLoader.fetch.items.map((item) => ({
        label: isDuplicate(item.products?.id ?? '', (form.values as any).customer_id ?? '')
          ? `${item.products?.name} (มีแล้ว)`
          : item.products?.name,
        value: item.products?.id,
        disabled: isDuplicate(item.products?.id ?? '', (form.values as any).customer_id ?? ''),
      })),
      loading: targetLoader.fetch.status.isLoading,
    },
  },
])

const getItemFormFields = (index: number) => [
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: 'สถานะ',
      name: `items[${index}].status` as any,
      required: true,
      options: statusOptions,
    },
  },
  {
    type: INPUT_TYPES.TEXTAREA,
    props: {
      label: 'รายละเอียด',
      name: `items[${index}].description` as any,
      required: false,
    },
  },
]

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
      options: filteredCustomers.value.map((item) => ({
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
  if (!props.isEditing) {
    const {
      customer_id, items,
    } = values as any

    const normalizedItems = items.map((item: any) => ({
      ...item,
      customer_id,
    }))

    props.onSubmit({
      items: normalizedItems,
    })
  } else {
    props.onSubmit(values)
  }
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

  if (zoneLoader.fetch.items.length === 0) {
    zoneLoader.fetchPage()
  }
})
</script>
