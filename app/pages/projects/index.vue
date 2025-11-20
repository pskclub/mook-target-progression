<template>
  <div>
    <div class="mb-8">
      <Button
        trailing-icon="ph:plus"
        @click="onAdd"
      >
        เพิ่ม Project
      </Button>
    </div>
    <Table
      :options="tableOptions"
      @pageChange="project.fetchPageChange"
      @search="project.fetchSearch"
    >
      <template #name-cell="{ row }">
        <a
          :href="`/projects/${row.original.id}`"
          class="text-primary cursor-pointer hover:underline"
          @click.prevent="navigateTo(`/projects/${row.original.id}`)"
        >
          {{ row.original.name }}
        </a>
      </template>
      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <ButtonActionIcon
            icon="ph:pencil-simple"
            color="neutral"
            :to="`/projects/${row.original.id}`"
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
import { routes } from '~/constants/routes'
import FormModal from '~/components/Project/FormModal.vue'

useHead({
  title: routes.projects.label,
})

useApp().definePage({
  title: routes.projects.label,
})

const project = useProjectsPageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)

const tableOptions = useTable({
  repo: project,
  columns: () => [
    {
      accessorKey: 'name',
      header: 'Name',
      type: COLUMN_TYPES.TEXT,
    },
    {
      accessorKey: 'created_at',
      header: 'Created at',
      type: COLUMN_TYPES.DATE,
      meta: {
        class: {
          th: 'text-right w-[50px]',
          td: 'text-right w-[50px]',
        },
      },
    },
    {
      accessorKey: 'actions',
      header: '',
      meta: {
        class: {
          th: 'text-right w-[50px]',
          td: 'text-right w-[50px]',
        },
      },
    },
  ],
})

const onEdit = (values: IProject) => {
  editModal.open({
    isEditing: true,
    values: values,
    status: () => project.update.status,
    onSubmit: (payload: IProject) => {
      project.updateRun(String(values.id), {
        data: payload,
      })
    },
  })
}

const onAdd = () => {
  addModal.open({
    status: () => project.add.status,
    onSubmit: (payload: IProject) => {
      project.addRun({
        data: payload,
      })
    },
  })
}

const onDelete = (values: IProject) => {
  dialog
    .confirm({
      title: 'ยืนยันการลบ',
      description: `คุณต้องการลบ Project "${values.name}" หรือไม่?`,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      type: DialogType.ERROR,
    })
    .then(() => {
      dialog.loading({
        title: 'กรุณารอสักครู่...',
        description: 'กำลังส่งข้อมูล...',
      })

      project.deleteRun(String(values.id))
    })
}

project.fetchSetLoading()
onMounted(() => {
  project.fetchPage()
})

useWatchTrue(
  () => project.update.status.isSuccess,
  () => {
    editModal.close()
    project.fetchPage()

    noti.success({
      title: 'แก้ไข Project สำเร็จ',
      description: 'คุณได้แก้ไข Project เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => project.update.status.isError,
  () => {
    editModal.close()
    dialog.close()
    noti.error({
      title: 'แก้ไข Project ไม่สำเร็จ',
      description: StringHelper.getError(
        project.update.status.errorData,
        'เกิดข้อผิดพลาดในการแก้ไข Project  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => project.delete.status.isSuccess,
  () => {
    editModal.close()
    project.fetchPage()
    dialog.close()
    noti.success({
      title: 'ลบ Project สำเร็จ',
      description: 'คุณได้ลบ Project เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => project.delete.status.isError,
  () => {
    dialog.close()
    noti.error({
      title: 'ลบ Project ไม่สำเร็จ',
      description: StringHelper.getError(
        project.delete.status.errorData,
        'เกิดข้อผิดพลาดในการลบ Project  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => project.add.status.isSuccess,
  () => {
    addModal.close()
    project.fetchPage()
    dialog.close()
    noti.success({
      title: 'เพิ่ม Project สำเร็จ',
      description: 'คุณได้เพิ่ม Project เรียบร้อยแล้ว',
    })

    dialog.close()
  },
)

useWatchTrue(
  () => project.add.status.isError,
  () => {
    addModal.close()
    dialog.close()
    noti.error({
      title: 'เพิ่ม Project ไม่สำเร็จ',
      description: StringHelper.getError(
        project.add.status.errorData,
        'เกิดข้อผิดพลาดในการเพิ่ม Project  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)
</script>
