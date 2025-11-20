<template>
  <div>
    <div class="mb-8">
      <Button
        trailing-icon="ph:plus"
        @click="onAdd"
      >
        เพิ่ม Customer
      </Button>
    </div>
    <Table
      :options="tableOptions"
      @pageChange="customer.fetchPageChange"
      @search="customer.fetchSearch"
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
import { routes } from '~/constants/routes'
import FormModal from '~/components/Customer/FormModal.vue'

useHead({
  title: routes.customers.label,
})

useApp().definePage({
  title: routes.customers.label,
})

const customer = useCustomerPageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)

const tableOptions = useTable({
  repo: customer,
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

const onEdit = (values: ICustomer) => {
  editModal.open({
    isEditing: true,
    values: values,
    status: () => customer.update.status,
    onSubmit: (payload: ICustomer) => {
      customer.updateRun(values.id, {
        data: payload,
      })
    },
  })
}

const onAdd = () => {
  addModal.open({
    status: () => customer.add.status,
    onSubmit: (payload: ICustomer) => {
      customer.addRun({
        data: payload,
      })
    },
  })
}

const onDelete = (values: ICustomer) => {
  dialog
    .confirm({
      title: 'ยืนยันการลบ',
      description: `คุณต้องการลบ Customer "${values.name}" หรือไม่?`,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      type: DialogType.ERROR,
    })
    .then(() => {
      dialog.loading({
        title: 'กรุณารอสักครู่...',
        description: 'กำลังส่งข้อมูล...',
      })

      customer.deleteRun(values.id)
    })
}

customer.fetchSetLoading()
onMounted(() => {
  customer.fetchPage()
})

useWatchTrue(
  () => customer.update.status.isSuccess,
  () => {
    editModal.close()
    customer.fetchPage()

    noti.success({
      title: 'แก้ไข Customer สำเร็จ',
      description: 'คุณได้แก้ไข Customer เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => customer.update.status.isError,
  () => {
    editModal.close()
    dialog.close()
    noti.error({
      title: 'แก้ไข Customer ไม่สำเร็จ',
      description: StringHelper.getError(
        customer.update.status.errorData,
        'เกิดข้อผิดพลาดในการแก้ไข Customer  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => customer.delete.status.isSuccess,
  () => {
    editModal.close()
    customer.fetchPage()
    dialog.close()
    noti.success({
      title: 'ลบ Customer สำเร็จ',
      description: 'คุณได้ลบ Customer เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => customer.delete.status.isError,
  () => {
    dialog.close()
    noti.error({
      title: 'ลบ Customer ไม่สำเร็จ',
      description: StringHelper.getError(
        customer.delete.status.errorData,
        'เกิดข้อผิดพลาดในการลบ Customer  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => customer.add.status.isSuccess,
  () => {
    addModal.close()
    customer.fetchPage()
    dialog.close()
    noti.success({
      title: 'เพิ่ม Customer สำเร็จ',
      description: 'คุณได้เพิ่ม Customer เรียบร้อยแล้ว',
    })

    dialog.close()
  },
)

useWatchTrue(
  () => customer.add.status.isError,
  () => {
    addModal.close()
    dialog.close()
    noti.error({
      title: 'เพิ่ม Customer ไม่สำเร็จ',
      description: StringHelper.getError(
        customer.add.status.errorData,
        'เกิดข้อผิดพลาดในการเพิ่ม Customer  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)
</script>
