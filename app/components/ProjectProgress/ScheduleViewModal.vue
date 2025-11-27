<template>
  <Modal
    :close="{ onClick: () => emits('close', false) }"
    :dismissible="true"
    :title="`กำหนดการของการดำเนินการ ${scheduleItems.length > 0 ? `(${scheduleItems.length})` : ''}`"
    description="จัดการกำหนดการสำหรับการดำเนินการนี้"
    :ui="{
      content: 'max-w-4xl',
    }"
  >
    <template #body>
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
          :options="tableOptions"
        >
          <template #actions-cell="{ row }">
            <div class="flex justify-end">
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
      <div v-else>
        <CalendarView
          :schedules="scheduleItems"
          @scheduleClick="onEdit"
        />
      </div>
    </template>
  </Modal>
</template>

<script lang="ts" setup>
import CalendarView from '~/components/ProjectSchedule/CalendarView.vue'
import FormModal from '~/components/ProjectSchedule/FormModal.vue'
import type { IProjectProgress, IProjectSchedule } from '~/loaders/project-detail'

const emits = defineEmits<{ close: [boolean] }>()

const props = defineProps<{
  progress: IProjectProgress
  projectId: string
  zoneId: string
  onRefresh: () => void
}>()

const viewMode = ref<'table' | 'calendar'>('calendar')
const loader = useProjectScheduleLoader(props.projectId)
const project = useProjectsPageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)

const scheduleItems = computed(() => {
  return (ArrayHelper.toArray(project.find.item?.project_schedules) as IProjectSchedule[])
    .filter((item) => {
      if (props.zoneId && item.zone_id !== props.zoneId) {
        return false
      }

      if (props.progress.id && item.progress_id !== props.progress.id) {
        return false
      }

      return true
    })
})

const tableOptions = useTableSimple({
  items: () => scheduleItems.value,
  columns: () => [
    {
      accessorKey: 'date',
      header: 'วันที่',
      type: COLUMN_TYPES.DATE,
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

const onEdit = (values: IProjectSchedule) => {
  editModal.open({
    isEditing: true,
    values: values,
    projectId: props.projectId,
    productId: props.progress!.product_id,
    customerId: props.progress!.customer_id,
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
    productId: props.progress!.product_id,
    customerId: props.progress!.customer_id,
    projectId: props.projectId,
    status: () => loader.add.status,
    onSubmit: (payload: IProjectSchedule[]) => {
      const payloadItems = payload.map((item) => ({
        ...item,
        zone_id: props.zoneId,
        project_id: props.projectId,
        progress_id: props.progress.id,
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

// Watch for success/error states
useWatchTrue(
  () => loader.update.status.isSuccess,
  () => {
    editModal.close()
    props.onRefresh()
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
    props.onRefresh()
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
    props.onRefresh()
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
</script>
