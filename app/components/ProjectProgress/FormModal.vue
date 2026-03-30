<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="false"
    :title="isEditing ? 'แก้ไขการดำเนินการ' : 'เพิ่มการดำเนินการ'"
    description="Project Progress info."
    :ui="{
      content: isEditing ? undefined:'max-w-7xl',
    }"
  >
    <template #body>
      <form @submit="onSubmit">
        <template v-if="isEditing">
          <FormFields :options="formFields" />
        </template>
        <template v-else>
          <div class="grid grid-cols-2 gap-4">
            <div
              v-for="(field, index) in fields"
              :key="field.key"
              class="relative mb-4 rounded-md border border-gray-200 p-4 pt-10"
            >
              <div class="absolute top-3 left-4 text-sm font-bold text-gray-500">
                รายการที่ {{ index + 1 }}
              </div>
              <ButtonActionIcon
                v-if="fields.length > 1"
                icon="ph:trash"
                color="error"
                class="absolute top-2 right-2"
                @click="remove(index)"
              />

              <FormFields :options="getArrayFormFields(index)" />
            </div>
          </div>
          <Button
            variant="outline"
            leading-icon="ph:plus"
            type="button"
            block
            @click="push({
              product_id: '',
              customer_id: '',
              status: 'PENDING',
              description: '',
            })"
          >
            เพิ่มรายการ
          </Button>
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

const schemaObj = props.isEditing
  ? v.object({
    product_id: v.optional(v.pipe(v.string(), v.nonEmpty('กรุณาเลือกสินค้า')), ''),
    customer_id: v.optional(v.pipe(v.string(), v.nonEmpty('กรุณาเลือกลูกค้า')), ''),
    status: v.optional(v.pipe(v.string(), v.nonEmpty()), 'PENDING'),
    description: v.optional(v.string(), ''),
  })
  : v.object({
    items: v.array(
      v.object({
        product_id: v.pipe(v.string(), v.nonEmpty('กรุณาเลือกสินค้า')),
        customer_id: v.pipe(v.string(), v.nonEmpty('กรุณาเลือกลูกค้า')),
        status: v.optional(v.string(), 'PENDING'),
        description: v.optional(v.string(), ''),
      }),
    ),
  })

const form = useForm({
  initialValues: props.isEditing
    ? props.values
    : {
      items: [
        {
          product_id: '',
          customer_id: '',
          status: 'PENDING',
          description: '',
        },
      ],
    },
  validationSchema: toTypedSchema(schemaObj),
})

const {
  fields, push, remove,
} = useFieldArray('items')

const getArrayFormFields = (index: number) => {
  return [
    {
      type: INPUT_TYPES.SELECT,
      props: {
        label: 'สินค้า',
        name: `items[${index}].product_id` as any,
        required: true,
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
        name: `items[${index}].customer_id` as any,
        required: true,
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
}

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
