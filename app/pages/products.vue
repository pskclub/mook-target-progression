<template>
  <div>
    <div class="mb-8">
      <Button
        trailing-icon="ph:plus"
        @click="onAdd"
      >
        เพิ่ม Product
      </Button>
    </div>
    <Table
      :options="tableOptions"
      @pageChange="product.fetchPageChange"
      @search="product.fetchSearch"
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
import FormModal from '~/components/Product/FormModal.vue'

useHead({
  title: routes.products.label,
})

useApp().definePage({
  title: routes.products.label,
})

const product = useProductsPageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)

const tableOptions = useTable({
  repo: product,
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

const onEdit = (values: IProduct) => {
  editModal.open({
    isEditing: true,
    values: values,
    status: () => product.update.status,
    onSubmit: (payload: IProduct) => {
      product.updateRun(values.id, {
        data: payload,
      })
    },
  })
}

const onAdd = () => {
  addModal.open({
    status: () => product.add.status,
    onSubmit: (payload: IProduct) => {
      product.addRun({
        data: payload,
      })
    },
  })
}

const onDelete = (values: IProduct) => {
  dialog
    .confirm({
      title: 'ยืนยันการลบ',
      description: `คุณต้องการลบ Product "${values.name}" หรือไม่?`,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      type: DialogType.ERROR,
    })
    .then(() => {
      dialog.loading({
        title: 'กรุณารอสักครู่...',
        description: 'กำลังส่งข้อมูล...',
      })

      product.deleteRun(values.id)
    })
}

product.fetchSetLoading()
onMounted(() => {
  product.fetchPage()
})

useWatchTrue(
  () => product.update.status.isSuccess,
  () => {
    editModal.close()
    product.fetchPage()

    noti.success({
      title: 'แก้ไข Product สำเร็จ',
      description: 'คุณได้แก้ไข Product เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => product.update.status.isError,
  () => {
    editModal.close()
    dialog.close()
    noti.error({
      title: 'แก้ไข Product ไม่สำเร็จ',
      description: StringHelper.getError(
        product.update.status.errorData,
        'เกิดข้อผิดพลาดในการแก้ไข Product  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => product.delete.status.isSuccess,
  () => {
    editModal.close()
    product.fetchPage()
    dialog.close()
    noti.success({
      title: 'ลบ Product สำเร็จ',
      description: 'คุณได้ลบ Product เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => product.delete.status.isError,
  () => {
    dialog.close()
    noti.error({
      title: 'ลบ Product ไม่สำเร็จ',
      description: StringHelper.getError(
        product.delete.status.errorData,
        'เกิดข้อผิดพลาดในการลบ Product  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => product.add.status.isSuccess,
  () => {
    addModal.close()
    product.fetchPage()
    dialog.close()
    noti.success({
      title: 'เพิ่ม Product สำเร็จ',
      description: 'คุณได้เพิ่ม Product เรียบร้อยแล้ว',
    })

    dialog.close()
  },
)

useWatchTrue(
  () => product.add.status.isError,
  () => {
    addModal.close()
    dialog.close()
    noti.error({
      title: 'เพิ่ม Product ไม่สำเร็จ',
      description: StringHelper.getError(
        product.add.status.errorData,
        'เกิดข้อผิดพลาดในการเพิ่ม Product  กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)
</script>
