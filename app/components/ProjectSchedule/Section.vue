<template>
  <!-- Filter section when zoneId is not provided -->
  <FormFields
    v-if="!zoneId"
    :options="formFields"
    class="flex gap-4"
  />
  <div class="mb-4 flex items-center justify-between">
    <div class="flex gap-2">
      <Button
        :variant="viewMode === 'calendar' ? 'solid' : 'ghost'"
        size="sm"
        leading-icon="ph:calendar"
        @click="viewMode = 'calendar'"
      >
        ปฏิทิน
      </Button>
      <Button
        :variant="viewMode === 'table' ? 'solid' : 'ghost'"
        size="sm"
        leading-icon="ph:table"
        @click="viewMode = 'table'"
      >
        ตาราง
      </Button>
    </div>
    <Button
      v-if="zoneId && !props.disableAdd"
      trailing-icon="ph:plus"
      size="sm"
      @click="onAdd"
    >
      เพิ่มกำหนดการ
    </Button>
  </div>

  <!-- Table View -->
  <div v-if="viewMode === 'table'">
    <TableSimple
      v-model:column-visibility="columnVisibility"
      :options="tableOptions"
    >
      <template #zone-cell="{ row }">
        <Badge
          variant="subtle"
          class="text-white"
          :style="`background-color: ${row.original.zones?.color};`"
        >
          {{ row.original.zones?.name }}
        </Badge>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <ButtonActionIcon
            v-if="row.original.histories?.length > 0"
            icon="ph:clock-counter-clockwise"
            color="error"
            @click="onViewHistory(row.original)"
          />
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

  <!-- Calendar View -->
  <Card v-else>
    <CalendarView
      :schedules="scheduleItems"
      @scheduleClick="onEdit"
      @historyClick="onViewHistory"
    />
  </Card>
</template>

<script lang="ts" setup>
import FormModal from '~/components/ProjectSchedule/FormModal.vue'
import CalendarView from '~/components/ProjectSchedule/CalendarView.vue'
import type { IProjectSchedule } from '~/loaders/project-detail'

const emits = defineEmits(['refresh'])
const props = defineProps<{
  projectId: string
  zoneId?: string
  disableAdd?: boolean
}>()

const loader = useProjectScheduleLoader(props.projectId)
const project = useProjectsPageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)
const historyModal = overlay.create(FormModal)
const columnVisibility = ref({
  start_date: true,
  end_date: true,
  zone: !props.zoneId,
  products_name: true,
  customers_name: true,
  description: true,
  actions: true,
})

const viewMode = ref<'table' | 'calendar'>('calendar')

// Filter form (only used when zoneId is not provided)
const zoneLoader = useZonePageLoader()
const form = useForm({
  validationSchema: toTypedSchema(
    v.object({
      zone_id: v.nullish(v.string()),
      product_id: v.nullish(v.string()),
      customer_id: v.nullish(v.string()),
    }),
  ),
})

const zones = computed(() => {
  return zoneLoader.fetch.items
})

const products = computed(() => {
  return useProjectDetail().scheduleProducts.value
})

const customers = computed(() => {
  return useProjectDetail().scheduleCustomers.value
})

const formFields = createFormFields(() => [
  {
    type: INPUT_TYPES.SELECT,
    class: 'w-[200px]',
    props: {
      label: '',
      name: 'zone_id',
      placeholder: 'Zone',
      clearable: true,
      options: zones.value.map((zone) => ({
        label: zone.name,
        value: zone.id,
      })),
    },
  },
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
])

const onViewHistory = (values: IProjectSchedule) => {
  historyModal.open({
    projectId: props.projectId,
    isViewHistory: true,
    values: values,
    status: () => ({
      isLoading: false,
    }),
    onSubmit: () => {},
  })
}

const onEdit = (values: IProjectSchedule) => {
  editModal.open({
    projectId: props.projectId,
    isEditing: true,
    values: values,
    status: () => loader.update.status,
    onSubmit: (payload: IProjectSchedule) => {
      loader.updateRun(String(values.id), {
        data: payload,
      })
    },
  })
}

const onAdd = () => {
  addModal.open({
    projectId: props.projectId,
    status: () => loader.add.status,
    onSubmit: (payload: IProjectSchedule[]) => {
      const payloadItems = payload.map((item) => ({
        ...item,
        zone_id: props.zoneId,
        project_id: props.projectId,
      }))

      loader.addRun({
        data: payloadItems,
      })
    },
  })
}

const onDelete = (values: IProjectSchedule) => {
  dialog
    .confirm({
      title: 'ยืนยันการลบ',
      description: 'คุณต้องการลบกำหนดการนี้หรือไม่?',
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

useWatchTrue(
  () => loader.update.status.isSuccess,
  () => {
    editModal.close()
    emits('refresh')
    noti.success({
      title: 'แก้ไขกำหนดการสำเร็จ',
      description: 'คุณได้แก้ไขกำหนดการเรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.update.status.isError,
  () => {
    editModal.close()
    dialog.close()
    noti.error({
      title: 'แก้ไขกำหนดการไม่สำเร็จ',
      description: StringHelper.getError(
        loader.update.status.errorData,
        'เกิดข้อผิดพลาดในการแก้ไขกำหนดการ กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => loader.delete.status.isSuccess,
  () => {
    emits('refresh')
    dialog.close()
    noti.success({
      title: 'ลบกำหนดการสำเร็จ',
      description: 'คุณได้ลบกำหนดการเรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.delete.status.isError,
  () => {
    dialog.close()
    noti.error({
      title: 'ลบกำหนดการไม่สำเร็จ',
      description: StringHelper.getError(
        loader.delete.status.errorData,
        'เกิดข้อผิดพลาดในการลบกำหนดการ กรุณาลองใหม่อีกครั้ง',
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
      title: 'เพิ่มกำหนดการสำเร็จ',
      description: 'คุณได้เพิ่มกำหนดการเรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.add.status.isError,
  () => {
    addModal.close()
    dialog.close()
    noti.error({
      title: 'เพิ่มกำหนดการไม่สำเร็จ',
      description: StringHelper.getError(
        loader.add.status.errorData,
        'เกิดข้อผิดพลาดในการเพิ่มกำหนดการ กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

const scheduleItems = computed(() => {
  return (ArrayHelper.toArray(project.find.item?.project_schedules) as IProjectSchedule[])
    .filter((item) => {
      // Filter by zoneId prop (when viewing from zone tab)
      if (props.zoneId && item.zone_id !== props.zoneId) {
        return false
      }

      // Filter by form values (when zoneId is not provided)
      if (!props.zoneId) {
        if (form.values.zone_id && item.zone_id !== form.values.zone_id) {
          return false
        }

        if (form.values.product_id && item.product_id !== form.values.product_id) {
          return false
        }

        if (form.values.customer_id && item.customer_id !== form.values.customer_id) {
          return false
        }
      }

      return true
    })
})

const tableOptions = useTableSimple({
  items: () => scheduleItems.value,
  columns: () => [
    {
      accessorKey: 'start_date',
      header: 'วันที่เริ่มต้น',
      type: COLUMN_TYPES.DATE,
    },
    {
      accessorKey: 'end_date',
      header: 'วันที่สิ้นสุด',
      type: COLUMN_TYPES.DATE,
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
      accessorKey: 'products.name',
      header: 'สินค้า',
      type: COLUMN_TYPES.TEXT,
      cell: ({
        row,
      }: any) => row.original.products?.name || '-',
    },
    {
      accessorKey: 'customers.name',
      header: 'ลูกค้า',
      type: COLUMN_TYPES.TEXT,
      cell: ({
        row,
      }: any) => row.original.customers?.name || '-',
    },
    {
      accessorKey: 'description',
      header: 'รายละเอียด',
      type: COLUMN_TYPES.TEXT,
    },
    {
      accessorKey: 'actions',
      header: '',
      meta: {
        class: {
          th: 'text-right w-[100px]',
          td: 'text-right w-[100px]',
        },
      },
    },
  ],
})
</script>
