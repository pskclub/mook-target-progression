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
          label: `Products (${project.find.item?.project_targets?.length || 0})`,
          icon: 'i-lucide-user',
          value: 'target',
          slot: 'target',
        },
        {
          label: `Progress (${project.find.item?.project_progresses?.length || 0})`,
          icon: 'i-lucide-lock',
          slot: 'progress',
          value: 'progress',
        },
        {
          label: `Calendar (${project.find.item?.project_schedules?.length || 0})`,
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
        <div class="mb-6 flex items-center gap-4">
          <p class="text-xl font-bold">
            เลือกเขต:
          </p>
          <SelectMenu
            v-model="selectedZoneId"
            class="w-[300px]"
            :items="zoneOptions"
            size="xl"
            :loading="zoneLoader.fetch.status.isLoading"
            placeholder="เลือกเขต"
            value-key="value"
            label-key="label"
          >
            <template #item="{ item }">
              <p
                :style="{
                  color: item.color,
                }"
              >
                {{ item.label }}
              </p>
            </template>

            <template #default="{ modelValue }">
              <p
                :style="{
                  color: zoneOptions.find((item) => item.value === modelValue)?.color,
                }"
              >
                {{ zoneOptions.find((item) => item.value === modelValue)?.label || '-' }}
              </p>
            </template>
          </SelectMenu>
        </div>
        <!-- Vertical Zone Tabs -->
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
            <p class="text-xl font-bold">
              กำหนดการ <span
                v-if="project.find.item?.project_schedules?.
                  filter((item: any) => item.zone_id === selectedZoneId)?.length || 0 > 0"
              >({{ project.find.item?.project_schedules?.
                filter((item: any) => item.zone_id === selectedZoneId)?.length || 0 }})</span>
            </p>
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
const selectedZoneId = ref<string | undefined>(undefined)
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)

// Load project data
project.findSetLoading()
zoneLoader.fetchSetLoading()

const zoneOptions = computed(() => {
  return zoneLoader.fetch.items.map((zone) => ({
    label: `${zone.name} ${project.find.item?.project_progresses
      ?.filter((item: any) => item.zone_id === zone.id)?.length || 0 > 0
      ? `(${project.find.item?.project_progresses
        ?.filter((item: any) => item.zone_id === zone.id)?.length || 0})`
      : ''}`,
    value: zone.id,
    color: zone.color,
  }))
})

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
