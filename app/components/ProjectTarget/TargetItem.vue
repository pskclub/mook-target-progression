<template>
  <Card class="min-w-[300px]">
    <div class="flex justify-between">
      <div class="flex items-center gap-4">
        <p class="font-bold">
          สินค้า: {{ row.products?.name }}
        </p>
        <p>เป้าหมาย: {{ row.amount }}</p>
      </div>
      <DropdownMenu
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
    <div
      class="space-y-2"
    >
      <FormFields
        class="w-full"
        :options="formFields"
      />

      <p v-if="projectProgressesByProductId.length">
        ผลการค้นหา {{ projectProgressesByProductId.length }} รายการ
      </p>
      <Empty v-else />
      <div
        v-for="progress in projectProgressesByProductId"
        :key="progress.id"
        class="space-y-2"
      >
        <div class="flex flex-col">
          <p class="font-medium">
            {{ progress.customers?.name }}
          </p>
          <div class="flex gap-2">
            <Badge
              variant="subtle"
            >
              {{ progress.zones?.name }}
            </Badge>
            <Badge
              :color="getStatusColor(progress.status)"
              variant="subtle"
            >
              {{ PROJECT_PROGRESS_STATUS_LABEL[progress.status as keyof typeof PROJECT_PROGRESS_STATUS_LABEL] }}
            </Badge>
          </div>
        </div>
      </div>
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
  zones: IZone[]
}>()

const loader = useProjectTargetLoader(props.row.project_id)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const form = useForm({
  validationSchema: toTypedSchema(
    v.object({
      zone_id: v.nullish(v.pipe(v.string()), undefined),
      status: v.nullish(v.pipe(v.string()), undefined),
    }),
  ),
})

const formFields = createFormFields(() => [
  {
    type: INPUT_TYPES.SELECT,
    props: {
      label: '',
      name: 'zone_id',
      placeholder: 'เขต',
      clearable: true,
      options: props.zones.map((zone) => ({
        label: zone.name,
        value: zone.id,
      })),
    },
  },
  {
    type: INPUT_TYPES.SELECT,
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

const projectProgressesByProductId = computed(() => {
  let filtered = props.projectProgresses.filter((progress) => progress.product_id === props.row.product_id)

  if (form.values.zone_id) {
    filtered = filtered.filter((progress) => progress.zone_id === form.values.zone_id)
  }

  if (form.values.status) {
    filtered = filtered.filter((progress) => progress.status === form.values.status)
  }

  return filtered
})

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
