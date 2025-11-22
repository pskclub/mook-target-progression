<template>
  <StatusBox
    :status="project.find.status"
    :data="project.find.item"
  >
    <div class="mb-6 flex items-center justify-between">
      <Button
        leading-icon="ph:arrow-left"
        variant="ghost"
        :to="routes.projects.to"
      >
        กลับ
      </Button>

      <Button
        leading-icon="ph:pencil-simple"
        variant="outline"
        @click="onEdit"
      >
        แก้ไขโครงการ
      </Button>
    </div>

    <!-- Dashboard Cards -->
    <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <div class="p-6">
          <h3 class="text-lg font-semibold">
            เป้าหมายทั้งหมด
          </h3>
          <p class="text-primary mt-2 text-3xl font-bold">
            {{ dashboardStats.targets }}
          </p>
        </div>
      </Card>
      <Card>
        <div class="p-6">
          <h3 class="text-lg font-semibold">
            ความคืบหน้า
          </h3>
          <p class="text-primary mt-2 text-3xl font-bold">
            {{ dashboardStats.progress }}
          </p>
        </div>
      </Card>
    </div>

    <ProjectTargetSection
      :project-progresses="projectProgressLoader.fetch.items"
      :project-id="projectId"
    />
    <!-- Zone Tabs and Content -->
    <div class="flex gap-6">
      <!-- Vertical Zone Tabs -->
      <Card class="h-fit w-64 shrink-0">
        <h3 class="mb-4 font-semibold">
          เขต (Zones)
        </h3>

        <!-- Loading Skeleton -->
        <div
          v-if="zoneLoader.fetch.status.isLoading"
          class="space-y-2"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="h-12 w-full animate-pulse rounded-lg bg-gray-100"
          />
        </div>

        <!-- Zone List -->
        <div
          v-else
          class="space-y-2"
        >
          <button
            v-for="zone in zoneLoader.fetch.items"
            :key="zone.id"
            class="w-full cursor-pointer rounded-lg px-4 py-3 text-left transition-colors"
            :class="
              selectedZoneId === zone.id
                ? 'bg-primary text-white'
                : 'hover:bg-gray-100'
            "
            @click="selectedZoneId = zone.id"
          >
            {{ zone.name }}
          </button>
          <div
            v-if="zoneLoader.fetch.items.length === 0"
            class="py-4 text-center text-sm text-gray-500"
          >
            ไม่มีข้อมูลเขต
          </div>
        </div>
      </Card>

      <!-- Content Area -->
      <div class="flex-1">
        <!-- Loading Skeleton -->
        <div
          v-if="zoneLoader.fetch.status.isLoading"
          class="space-y-8"
        >
          <div class="h-[300px] w-full animate-pulse rounded-lg bg-gray-100" />
          <div class="h-[300px] w-full animate-pulse rounded-lg bg-gray-100" />
          <div class="h-[300px] w-full animate-pulse rounded-lg bg-gray-100" />
        </div>

        <div
          v-else-if="selectedZoneId"
          class="space-y-8"
        >
          <!-- Target of Product Section -->

          <!-- Project Progress Section -->
          <ProjectProgressSection
            :project-id="projectId"
            :zone-id="selectedZoneId"
          />

          <!-- Schedule Section -->
          <ProjectScheduleSection
            :project-id="projectId"
            :zone-id="selectedZoneId"
          />
        </div>
        <div
          v-else
          class="flex h-64 items-center justify-center"
        >
          <Card class="w-full">
            <div class="p-8 text-center text-gray-500">
              กรุณาเลือกเขตเพื่อดูข้อมูล
            </div>
          </Card>
        </div>
      </div>
    </div>
  </StatusBox>
</template>

<script lang="ts" setup>
import { routes } from '~/constants/routes'
import ProjectTargetSection from '~/components/ProjectTarget/Section.vue'
import ProjectProgressSection from '~/components/ProjectProgress/Section.vue'
import ProjectScheduleSection from '~/components/ProjectSchedule/Section.vue'
import FormModal from '~/components/Project/FormModal.vue'

const route = useRoute()
const projectId = route.params.id as string

const project = useProjectsPageLoader()
const projectProgressLoader = useProjectProgressLoader(projectId)
const zoneLoader = useZonePageLoader()

// Selected zone state
const selectedZoneId = ref<string | null>(null)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)

useHead({
  title: 'กำลังโหลด',
})

useApp().definePage({
  title: 'กำลังโหลด',
})

// Dashboard stats (mock data - replace with actual calculations)
const dashboardStats = computed(() => {
  const item = project.find.item

  if (!item) {
    return {
      targets: 0,
      progress: 0,
    }
  }

  const targets = item.project_targets?.reduce((sum, t) => sum + t.amount, 0) || 0
  const progress = item.project_progresses?.length || 0

  return {
    targets,
    progress,
  }
})

// Load project data
project.findSetLoading()
zoneLoader.fetchSetLoading()
projectProgressLoader.fetchSetLoading()

onMounted(() => {
  project.findRun(projectId, {
    params: {
      id: projectId,
      select: '*, project_targets(*), project_progresses(*)',
    },
  })

  zoneLoader.fetchPage()
  projectProgressLoader.fetchPage()
})

// Auto-select first zone when zones are loaded
useWatchTrue(() => zoneLoader.fetch.status.isSuccess, () => {
  if (zoneLoader.fetch.items.length > 0 && !selectedZoneId.value) {
    selectedZoneId.value = zoneLoader.fetch.items[0].id
  }
})

useWatchTrue(() => project.find.status.isSuccess, () => {
  useHead({
    title: project.find.item?.name,
  })

  useApp().definePage({
    title: project.find.item?.name,
  })
})

const onEdit = () => {
  editModal.open({
    isEditing: true,
    values: project.find.item,
    status: () => project.update.status,
    onSubmit: (values: any) => {
      project.updateRun(projectId, {
        data: values,
      })
    },
  })
}

useWatchTrue(() => project.update.status.isSuccess, () => {
  editModal.close()
  project.findRun(projectId, {
    params: {
      id: projectId,
      select: '*, project_targets(*), project_progresses(*)',
    },
  })
})

useWatchTrue(() => project.update.status.isError, () => {
  noti.error({
    title: 'เกิดข้อผิดพลาด',
    description: StringHelper.getError(project.update.status.errorData),
  })
})
</script>
