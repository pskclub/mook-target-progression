<template>
  <StatusBox
    :status="project.find.status"
    :data="project.find.item"
  >
    <TeleportSafe to="#header-right">
      <div>
        <Button
          leading-icon="ph:pencil-simple"
          variant="outline"
          @click="onEdit"
        >
          แก้ไขโครงการ
        </Button>
      </div>
    </TeleportSafe>
    <Tabs
      v-model="isTabActive"
      variant="link"
      :items="[
        {
          label: 'Products',
          icon: 'i-lucide-user',
          value: 'target',
          slot: 'target',
        },
        {
          label: 'Progress',
          icon: 'i-lucide-lock',
          slot: 'progress',
          value: 'progress',
        },
        {
          label: 'Calendar',
          icon: 'i-lucide-lock',
          slot: 'schedule',
          value: 'schedule',
        },
        {
          label: 'Zones',
          icon: 'i-lucide-lock',
          slot: 'zone',
          value: 'zone',
        },
      ]"
    >
      <template #target>
        <ProjectTargetSection
          :project-progresses="project.find.item?.project_progresses || []"
          :project-id="projectId"
          @refresh="onRefresh"
        />
      </template>
      <template #progress>
        <ProjectProgressSection
          :project-id="projectId"
        />
      </template>
      <template #zone>
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
                :style="{
                  backgroundColor: textToHexColor(zone.name),
                }"
                :class="
                  selectedZoneId === zone.id
                    ? ''
                    : 'hover:opacity-80'
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
                @refresh="onRefresh"
              />

              <!-- Schedule Section -->
              <ProjectScheduleSection
                :project-id="projectId"
                :zone-id="selectedZoneId"
                @refresh="onRefresh"
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
      </template>
      <template #schedule>
        <ProjectScheduleSection
          :project-id="projectId"
          @refresh="onRefresh"
        />
      </template>
    </Tabs>
  </StatusBox>
</template>

<script lang="ts" setup>
import ProjectTargetSection from '~/components/ProjectTarget/Section.vue'
import ProjectProgressSection from '~/components/ProjectProgress/Section.vue'
import ProjectScheduleSection from '~/components/ProjectSchedule/Section.vue'
import FormModal from '~/components/Project/FormModal.vue'

const route = useRoute()
const projectId = route.params.id as string

const project = useProjectsPageLoader()
const zoneLoader = useZonePageLoader()
const isTabActive = ref('target')
// Selected zone state
const selectedZoneId = ref<string | null>(null)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)

// Load project data
project.findSetLoading()
zoneLoader.fetchSetLoading()

const textToHexColor = (text: string): string => {
  // Simple hash function
  let hash = 0

  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash)
    hash = hash & hash // Convert to 32-bit integer
  }

  // Convert hash to pastel color (high lightness, low saturation)
  let color = '#'

  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF
    // Mix with white (255) to create pastel - use 70% white, 30% base color
    const pastel = Math.floor(value * 0.3 + 255 * 0.7)

    color += pastel.toString(16).padStart(2, '0')
  }

  return color
}

onMounted(() => {
  project.findRun(projectId, {
    params: {
      id: projectId,
    },
  })

  zoneLoader.fetchPage()
})

const onRefresh = () => {
  project.findRun(projectId, {
    params: {
      id: projectId,
    },
  })
}

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
