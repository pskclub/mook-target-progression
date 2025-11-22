<template>
  <div class="mb-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold">
        ตัวชี้วัด
      </h2>
      <Button
        trailing-icon="ph:plus"
        size="sm"
        @click="onAdd"
      >
        เพิ่ม Target
      </Button>
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
import FormModal from '~/components/ProjectTarget/FormModal.vue'
import type { IProjectProgress, IProjectTarget } from '~/loaders/project-detail'

const props = defineProps<{
  projectId: string
  projectProgresses: IProjectProgress[]
}>()

const loader = useProjectTargetLoader(props.projectId)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()

const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)

const tableOptions = useTable({
  repo: loader,
  options: {
    isHidePagination: true,
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
      accessorKey: 'amount',
      header: 'Total',
      type: COLUMN_TYPES.NUMBER,
      meta: {
        class: {
          td: 'text-right',
          th: 'text-right',
        },
      },
    },
    {
      accessorKey: 'pending',
      header: 'ขาขึ้น',
      type: COLUMN_TYPES.NUMBER,
      meta: {
        class: {
          td: 'text-right',
          th: 'text-right',
        },
      },
      cell: ({
        row,
      }: any) => {
        const progresses = props.projectProgresses

        return progresses.filter((p) => p.status === 'PENDING' && p.product_id === row.original.products?.id).length
      },
    },
    {
      accessorKey: 'approved',
      header: 'ขาลง',
      type: COLUMN_TYPES.NUMBER,
      meta: {
        class: {
          td: 'text-right',
          th: 'text-right',
        },
      },
      cell: ({
        row,
      }: any) => {
        const progresses = props.projectProgresses

        return progresses.filter((p) => p.status === 'APPROVED' && p.product_id === row.original.products?.id).length
      },
    },
    {
      accessorKey: 'cancel',
      header: 'ยกเลิก',
      type: COLUMN_TYPES.NUMBER,
      meta: {
        class: {
          td: 'text-right',
          th: 'text-right',
        },
      },
      cell: ({
        row,
      }: any) => {
        const progresses = props.projectProgresses

        return progresses.filter((p) => ['CANCELLED'].includes(p.status) && p.product_id === row.original.products?.id).length
      },
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

const onEdit = (values: IProjectTarget) => {
  editModal.open({
    isEditing: true,
    values: values,
    status: () => loader.update.status,
    onSubmit: (payload: IProjectTarget) => {
      loader.updateRun(String(values.id), {
        data: payload,
      })
    },
  })
}

const onAdd = () => {
  addModal.open({
    status: () => loader.add.status,
    onSubmit: (payload: IProjectTarget) => {
      loader.addRun({
        data: {
          ...payload,
          project_id: props.projectId,
        },
      })
    },
  })
}

const onDelete = (values: IProjectTarget) => {
  dialog
    .confirm({
      title: 'ยืนยันการลบ',
      description: `คุณต้องการลบ Target นี้หรือไม่?`,
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
      project_id: props.projectId,
    },
  })
}

useWatchTrue(
  () => loader.update.status.isError,
  () => {
    editModal.close()
    dialog.close()
    noti.error({
      title: 'แก้ไข Target ไม่สำเร็จ',
      description: StringHelper.getError(
        loader.update.status.errorData,
        'เกิดข้อผิดพลาดในการแก้ไข Target กรุณาลองใหม่อีกครั้ง',
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
      title: 'ลบ Target สำเร็จ',
      description: 'คุณได้ลบ Target เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.delete.status.isError,
  () => {
    dialog.close()
    noti.error({
      title: 'ลบ Target ไม่สำเร็จ',
      description: StringHelper.getError(
        loader.delete.status.errorData,
        'เกิดข้อผิดพลาดในการลบ Target กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => loader.add.status.isSuccess,
  () => {
    addModal.close()
    fetch()
    noti.success({
      title: 'เพิ่ม Target สำเร็จ',
      description: 'คุณได้เพิ่ม Target เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => loader.add.status.isError,
  () => {
    addModal.close()
    dialog.close()
    noti.error({
      title: 'เพิ่ม Target ไม่สำเร็จ',
      description: StringHelper.getError(
        loader.add.status.errorData,
        'เกิดข้อผิดพลาดในการเพิ่ม Target กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)
</script>
