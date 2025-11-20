<template>
  <div class="mb-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold">
        การดำเนินการ
      </h2>
      <Button
        trailing-icon="ph:plus"
        size="sm"
        @click="onAdd"
      >
        เพิ่มการดำเนินการ
      </Button>
    </div>
    <Table
      :options="tableOptions"
      @pageChange="loader.fetchPageChange"
      @search="loader.fetchSearch"
    >
      <template #status-cell="{ row }">
        <Badge
          :color="getStatusColor(row.original.status)"
          variant="subtle"
        >
          {{ row.original.status }}
        </Badge>
      </template>
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
import FormModal from '~/components/ProjectProgress/FormModal.vue'
import type { IProjectProgress } from '~/loaders/project-detail'

const props = defineProps<{
  projectId: string
  zoneId: string
}>()

const loader = useProjectProgressLoader(props.projectId)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)

const tableOptions = useTable({
  repo: loader,
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
      accessorKey: 'status',
      header: 'Status',
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

const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'neutral' => {
  const statusMap: Record<string, 'warning' | 'success' | 'error' | 'neutral'> = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  }

  return statusMap[status] || 'neutral'
}

const onEdit = (values: IProjectProgress) => {
  editModal.open({
    isEditing: true,
    values: values,
    projectId: props.projectId,
    zoneId: props.zoneId,
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
    zoneId: props.zoneId,
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
    loader.fetchPage()
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
    loader.fetchPage()
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
