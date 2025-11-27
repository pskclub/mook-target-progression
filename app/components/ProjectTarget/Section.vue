<template>
  <div class="mb-8">
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-xl font-bold">
        สินค้า
      </h2>
      <Button
        trailing-icon="ph:plus"
        size="sm"
        @click="onAdd"
      >
        เพิ่มสินค้า
      </Button>
    </div>
    <div class="flex max-w-full gap-4 overflow-x-scroll px-1 py-2">
      <TargetItem
        v-for="value in project.find.item?.project_targets"
        :key="value.id"
        :row="value"
        :project-progresses="props.projectProgresses"
        :zones="zoneLoader.fetch.items"
        @fetch="fetch"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import FormModal from '~/components/ProjectTarget/FormModal.vue'
import type { IProjectProgress, IProjectTarget } from '~/loaders/project-detail'
import TargetItem from './TargetItem.vue'

const props = defineProps<{
  projectId: string
  projectProgresses: IProjectProgress[]
}>()

const loader = useProjectTargetLoader(props.projectId)
const project = useProjectsPageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const zoneLoader = useZonePageLoader()

const addModal = overlay.create(FormModal)

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

const fetch = () => {
  project.findRun(props.projectId, {
    params: {
      id: props.projectId,
    },
  })
}

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
