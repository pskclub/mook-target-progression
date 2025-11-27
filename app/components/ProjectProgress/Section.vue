<template>
  <div class="mb-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold">
        การดำเนินการ
      </h2>
      <Button
        v-if="props.zoneId"
        trailing-icon="ph:plus"
        size="sm"
        @click="onAdd"
      >
        เพิ่มการดำเนินการ
      </Button>
    </div>
    <FormFields
      :options="formFields"
      class="flex gap-4"
    />
    <TableSimple
      v-model:column-visibility="columnVisibility"
      :options="tableOptions"
    >
      <template #status-cell="{ row }">
        <Badge
          :color="getStatusColor(row.original.status)"
          variant="subtle"
        >
          {{ PROJECT_PROGRESS_STATUS_LABEL[row.original.status as keyof typeof PROJECT_PROGRESS_STATUS_LABEL] }}
        </Badge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end gap-2">
          <Button
            size="xs"
            variant="ghost"
            leading-icon="ph:calendar"
            @click="onViewSchedule(row.original)"
          >
            กำหนดการ
          </Button>
          <ButtonActionIcon
            icon="ph:pencil-simple"
            color="neutral"
            @click="onEdit(row.original)"
          />
          <ButtonActionIcon
            icon="ph:trash"
            color="error"
            @click="onDelete(row.original)"
          />
        </div>
      </template>
    </TableSimple>
  </div>
</template>

<script lang="ts" setup>
import FormModal from '~/components/ProjectProgress/FormModal.vue'
import ScheduleViewModal from '~/components/ProjectProgress/ScheduleViewModal.vue'
import type { IProjectProgress } from '~/loaders/project-detail'
import { getStatusColor } from '~/constants/config'

const emits = defineEmits<{
  (e: 'refresh'): void
}>()

const props = defineProps<{
  projectId: string
  productId?: string
  zoneId?: string
}>()

const loader = useProjectProgressLoader(props.projectId)
const project = useProjectsPageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)
const scheduleModal = overlay.create(ScheduleViewModal)
const form = useForm({
  validationSchema: toTypedSchema(
    v.object({
      product_id: v.nullish(v.string()),
      customer_id: v.nullish(v.string()),
      status: v.nullish(v.string()),
    }),
  ),
})

const columnVisibility = ref({
  products_name: true,
  customers_name: true,
  status: true,
  actions: true,
  zone: !props.zoneId,
})

const products = computed(() => {
  const uniqueProducts = ArrayHelper.toArray(project.find.item?.project_progresses).reduce((acc, target) => {
    if (target.products && !acc.some((p) => p.id === target.products!.id)) {
      acc.push(target.products)
    }

    return acc
  }, [] as IProduct[])

  return uniqueProducts
})

const customers = computed(() => {
  const uniqueCustomers = ArrayHelper.toArray(project.find.item?.project_progresses).reduce((acc, target) => {
    if (target.customers && !acc.some((c) => c.id === target.customers!.id)) {
      acc.push(target.customers)
    }

    return acc
  }, [] as ICustomer[])

  return uniqueCustomers
})

const formFields = createFormFields(() => [
  {
    type: INPUT_TYPES.SELECT,
    class: 'w-[200px]',
    props: {
      label: '',
      name: 'product_id',
      placeholder: 'Product',
      clearable: true,
      options: products.value.map((product) => ({
        label: product.name,
        value: product.id,
      })),
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    class: 'w-[200px]',
    props: {
      label: '',
      name: 'customer_id',
      placeholder: 'Customer',
      clearable: true,
      options: customers.value.map((customer) => ({
        label: customer.name,
        value: customer.id,
      })),
    },
  },
  {
    type: INPUT_TYPES.SELECT,
    class: 'w-[200px]',
    props: {
      label: '',
      name: 'status',
      placeholder: 'สถานะ',
      clearable: true,
      options: Object.values(PROJECT_PROGRESS_STATUS).map((status) => ({
        label: PROJECT_PROGRESS_STATUS_LABEL[status],
        value: status,
      })),
    },
  },
])

const tableOptions = useTableSimple<IProjectProgress>({
  items: () => {
    return progressItems.value.filter((item) => {
      if (form.values.product_id && item.product_id !== form.values.product_id) {
        return false
      }

      if (form.values.customer_id && item.customer_id !== form.values.customer_id) {
        return false
      }

      if (form.values.status && item.status !== form.values.status) {
        return false
      }

      return true
    })
  },
  columns: () => [
    {
      accessorKey: 'products.name',
      header: 'Product',
      type: COLUMN_TYPES.TEXT,
      cell: ({
        row,
      }: any) => row.original.products?.name || '-',
    },
    {
      accessorKey: 'customers.name',
      header: 'Customer',
      type: COLUMN_TYPES.TEXT,
      cell: ({
        row,
      }: any) => row.original.customers?.name || '-',
    },
    {
      accessorKey: 'zone',
      header: 'Zone',
      type: COLUMN_TYPES.TEXT,
      cell: ({
        row,
      }: any) => row.original.zones?.name || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      type: COLUMN_TYPES.TEXT,
    },
    {
      accessorKey: 'actions',
      header: '',
      meta: {
        class: {
          th: 'text-right w-[180px]',
          td: 'text-right w-[180px]',
        },
      },
    },
  ],
})

const onViewSchedule = (values: IProjectProgress) => {
  scheduleModal.open({
    progress: values,
    projectId: props.projectId,
    zoneId: props.zoneId!,
    onRefresh: () => {
      emits('refresh')
    },
  })
}

const onEdit = (values: IProjectProgress) => {
  editModal.open({
    isEditing: true,
    values: values,
    projectId: props.projectId,
    zoneId: props.zoneId!,
    status: () => loader.update.status,
    onSubmit: (payload: IProjectProgress) => {
      loader.updateRun(String(values.id), {
        data: payload,
      })
    },
  })
}

const onAdd = () => {
  addModal.open({
    projectId: props.projectId,
    zoneId: props.zoneId!,
    status: () => loader.add.status,
    onSubmit: (payload: IProjectProgress) => {
      loader.addRun({
        data: {
          ...payload,
          zone_id: props.zoneId,
          project_id: props.projectId,
        },
      })
    },
  })
}

const onDelete = (values: IProjectProgress) => {
  dialog
    .confirm({
      title: 'ยืนยันการลบ',
      description: `คุณต้องการลบการดำเนินการนี้หรือไม่?`,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      type: DialogType.ERROR,
    })
    .then(() => {
      dialog.loading({
        title: 'กรุณารอสักครู่...',
        description: 'กำลังส่งข้อมูล...',
      })

      loader.deleteRun(String(values.id))
    })
}

const progressItems = computed(() => {
  const items = project.find.item?.project_progresses || []

  return items.filter((item) => {
    if (props.productId && item.product_id !== props.productId) {
      return false
    }

    if (props.zoneId && item.zone_id !== props.zoneId) {
      return false
    }

    return true
  })
})

// Watch for success/error states
useWatchTrue(
  () => loader.update.status.isSuccess,
  () => {
    editModal.close()
    emits('refresh')
    noti.success({
      title: 'แก้ไขการดำเนินการสำเร็จ',
      description: 'คุณได้แก้ไขการดำเนินการเรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.update.status.isError,
  () => {
    editModal.close()
    dialog.close()
    noti.error({
      title: 'แก้ไขการดำเนินการไม่สำเร็จ',
      description: StringHelper.getError(
        loader.update.status.errorData,
        'เกิดข้อผิดพลาดในการแก้ไขการดำเนินการ กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => loader.delete.status.isSuccess,
  () => {
    loader.fetchPage()
    dialog.close()
    noti.success({
      title: 'ลบการดำเนินการสำเร็จ',
      description: 'คุณได้ลบการดำเนินการเรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.delete.status.isError,
  () => {
    dialog.close()
    noti.error({
      title: 'ลบการดำเนินการไม่สำเร็จ',
      description: StringHelper.getError(
        loader.delete.status.errorData,
        'เกิดข้อผิดพลาดในการลบการดำเนินการ กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => loader.add.status.isSuccess,
  () => {
    addModal.close()
    emits('refresh')
    noti.success({
      title: 'เพิ่มการดำเนินการสำเร็จ',
      description: 'คุณได้เพิ่มการดำเนินการเรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.add.status.isError,
  () => {
    addModal.close()
    dialog.close()
    noti.error({
      title: 'เพิ่มการดำเนินการไม่สำเร็จ',
      description: StringHelper.getError(
        loader.add.status.errorData,
        'เกิดข้อผิดพลาดในการเพิ่มการดำเนินการ กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)
</script>
