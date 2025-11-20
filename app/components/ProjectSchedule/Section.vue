<template>
  <div class="mb-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold">
        กำหนดการ
      </h2>
      <div class="flex gap-2">
        <Button
          trailing-icon="ph:calendar"
          size="sm"
          variant="outline"
          @click="showCalendar"
        >
          ดูปฏิทิน
        </Button>
        <Button
          trailing-icon="ph:plus"
          size="sm"
          @click="onAdd"
        >
          เพิ่มกำหนดการ
        </Button>
      </div>
    </div>
    <Table
      :options="tableOptions"
      @pageChange="loader.fetchPageChange"
      @search="loader.fetchSearch"
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
    </Table>
  </div>
</template>

<script lang="ts" setup>
import FormModal from '~/components/ProjectSchedule/FormModal.vue'
import CalendarModal from '~/components/ProjectSchedule/CalendarModal.vue'
import type { IProjectSchedule } from '~/loaders/project-detail'

const props = defineProps<{
  projectId: string
  zoneId: string
}>()

const loader = useProjectScheduleLoader(props.projectId)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)
const calendarModal = overlay.create(CalendarModal)

const tableOptions = useTable({
  repo: loader,
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

const showCalendar = () => {
  calendarModal.open({
    schedules: loader.fetch.items,
  })
}

const onEdit = (values: IProjectSchedule) => {
  editModal.open({
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
    status: () => loader.add.status,
    onSubmit: (payload: IProjectSchedule) => {
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

// Load data
loader.fetchSetLoading()
onMounted(() => {
  fetch()
})

const fetch = (page = 1) => {
  loader.fetchPage(page, '', {
    params: {
      zone_id: props.zoneId,
      project_id: props.projectId,
    },
  })
}

// Watch for zone changes
watch(() => props.zoneId, () => {
  fetch()
})

// Watch for success/error states
useWatchTrue(
  () => loader.update.status.isSuccess,
  () => {
    editModal.close()
    fetch()
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
    fetch()
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
    loader.fetchPage()
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
