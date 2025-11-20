<template>
  <slot v-if="skip" />
  <template v-else>
    <Card v-if="status.isLoading">
      <div class="flex items-center justify-center py-12">
        <Loader />
      </div>
    </Card>

    <!-- Not Found State -->
    <Card v-else-if="status.isSuccess && !data || status.isError && status.errorData?.code === 'NOT_FOUND'">
      <div class="py-12 text-center">
        <Icon
          name="lucide:search-x"
          class="mx-auto mb-4 text-gray-400"
          size="48"
        />
        <h3 class="mb-2 text-lg font-medium text-gray-900">
          ไม่พบข้อมูล
        </h3>
        <p class="text-gray-600">
          ไม่พบข้อมูลที่คุณค้นหา กรุณาลองใหม่อีกครั้ง
        </p>
      </div>
    </Card>
    <Card v-else-if="status.isError">
      <div class="py-12 text-center">
        <Icon
          name="lucide:alert-circle"
          class="mx-auto mb-4 text-red-500"
          size="48"
        />
        <h3 class="mb-2 text-lg font-medium text-gray-900">
          เกิดข้อผิดพลาด
        </h3>
        <p class="text-gray-600">
          ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง
        </p>
      </div>
    </Card>
    <slot
      v-else-if="data"
      :data="data"
    />
  </template>
</template>

<script lang="ts" setup generic="T">
import type { IStatus } from '#core/types/lib'

defineProps<{
  status: IStatus
  data: T
  skip?: boolean
}>()
</script>
