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
    <FlexDeck
      :options="tableOptions"
      container-class="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7"
      @pageChange="loader.fetchPageChange"
      @search="loader.fetchSearch"
    >
      <template #default="{ row }: { row: IProjectTarget }">
        <TargetItem
          :row="row"
          :project-progresses="props.projectProgresses"
          @fetch="fetch"
        />
      </template>
    </FlexDeck>
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
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()

const addModal = overlay.create(FormModal)

const tableOptions = useFlexDeck({
  repo: loader,
  options: {
    isHidePagination: true,
  },
})

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
