<template>
  <Card>
    <div class="flex justify-between">
      <div class="flex items-center gap-4">
        <p>สินค้า: {{ row.products?.name }}</p>
        <p>จำนวน: {{ row.amount }}</p>
      </div>
      <DropdownMenu
        :portal="false"
        :items="[
          [
            {
              label: 'แก้ไข',
              icon: 'ph:pencil-simple',
              color: 'neutral',
              onClick: () => onEdit(row),
            },
            {
              label: 'ลบ',
              icon: 'ph:trash',
              color: 'error',
              onClick: () => onDelete(row),
            },
          ],
        ]"
      >
        <Button
          square
          variant="ghost"
          color="neutral"
          icon="ph:dots-three-vertical"
        />
      </DropdownMenu>
    </div>
    <Button
      v-if="projectProgressesByProductId(row.product_id).length > 0"
      variant="link"
      class="px-0"
      @click="isExpanded = !isExpanded"
    >
      {{ isExpanded ? 'ย่อ' : 'ดูรายละเอียด' }} ({{ projectProgressesByProductId(row.product_id).length }})
    </Button>
    <div
      v-if="isExpanded"
      class="space-y-2"
    >
      <Card
        v-for="progress in projectProgressesByProductId(row.product_id)"
        :key="progress.id"
        class="space-y-2"
      >
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center">
          <p>{{ progress.customers?.name }}</p>
          <p>
            <Badge
              :color="getStatusColor(progress.status)"
              variant="subtle"
            >
              {{ PROJECT_PROGRESS_STATUS_LABEL[progress.status as keyof typeof PROJECT_PROGRESS_STATUS_LABEL] }}
            </Badge>
          </p>
        </div>
      </Card>
    </div>
  </Card>
</template>

<script lang="ts" setup>
import FormModal from '~/components/ProjectTarget/FormModal.vue'
import { getStatusColor } from '~/constants/config'

const emits = defineEmits<{
  (e: 'fetch'): void
}>()

const props = defineProps<{
  row: IProjectTarget
  projectProgresses: IProjectProgress[]
}>()

const loader = useProjectTargetLoader(props.row.project_id)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const isExpanded = ref(false)
const editModal = overlay.create(FormModal)

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

const projectProgressesByProductId = (productId: string) => {
  return props.projectProgresses.filter((progress) => progress.product_id === productId)
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

useWatchTrue(() => loader.update.status.isSuccess, () => {
  emits('fetch')
  editModal.close()
  noti.success({
    title: 'แก้ไข Target สำเร็จ',
    description: 'คุณได้แก้ไข Target เรียบร้อยแล้ว',
  })
})

useWatchTrue(
  () => loader.update.status.isError,
  () => {
    emits('fetch')
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
    emits('fetch')
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
</script>
