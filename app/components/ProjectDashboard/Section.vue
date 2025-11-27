<template>
  <div class="space-y-6 pb-6">
    <!-- Summary Stats Cards -->
    <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Card class="text-center">
        <div class="p-4">
          <p class="text-primary text-3xl font-bold">
            {{ stats.totalProducts }}
          </p>
          <p class="text-sm text-gray-500">
            สินค้าทั้งหมด
          </p>
        </div>
      </Card>
      <Card class="text-center">
        <div class="p-4">
          <p class="text-3xl font-bold text-blue-600">
            {{ stats.totalProgress }}
          </p>
          <p class="text-sm text-gray-500">
            การดำเนินการทั้งหมด
          </p>
        </div>
      </Card>
      <Card class="text-center">
        <div class="p-4">
          <p class="text-3xl font-bold text-orange-500">
            {{ stats.totalSchedules }}
          </p>
          <p class="text-sm text-gray-500">
            กำหนดการทั้งหมด
          </p>
        </div>
      </Card>
      <Card class="text-center">
        <div class="p-4">
          <p class="text-3xl font-bold text-green-600">
            {{ stats.totalCustomers }}
          </p>
          <p class="text-sm text-gray-500">
            ลูกค้าทั้งหมด
          </p>
        </div>
      </Card>
    </div>

    <!-- Status Breakdown -->
    <div>
      <h3 class="mb-4 text-lg font-bold">
        สถานะการดำเนินการ
      </h3>
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card
          v-for="status in statusStats"
          :key="status.key"
          :ui="{
            body: 'flex items-center gap-3',
          }"
        >
          <Badge
            :color="status.color"
            variant="subtle"
            class="text-lg"
          >
            {{ status.count }}
          </Badge>
          <span class="text-sm">{{ status.label }}</span>
        </Card>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
      <!-- Progress by Zone -->
      <Card>
        <div class="p-4">
          <h3 class="mb-4 text-lg font-bold">
            การดำเนินการตามเขต
          </h3>
          <div class="space-y-3">
            <div
              v-for="zone in zoneStats"
              :key="zone.id"
              class="flex items-center gap-4"
            >
              <Badge
                variant="subtle"
                class="w-24 justify-center text-white"
                :style="`background-color: ${zone.color};`"
              >
                {{ zone.name }}
              </Badge>
              <div class="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  class="bg-primary h-full rounded-full transition-all"
                  :style="`width: ${zone.percentage}%;`"
                />
              </div>
              <span class="w-16 text-right text-sm font-medium">{{ zone.count }} รายการ</span>
            </div>
            <div
              v-if="zoneStats.length === 0"
              class="py-4 text-center text-gray-500"
            >
              ยังไม่มีข้อมูลการดำเนินการ
            </div>
          </div>
        </div>
      </Card>

      <!-- Progress by Product -->
      <Card>
        <div class="p-4">
          <h3 class="mb-4 text-lg font-bold">
            การดำเนินการตามสินค้า
          </h3>
          <div class="space-y-3">
            <div
              v-for="product in productStats"
              :key="product.id"
              class="flex items-center gap-4"
            >
              <span class="w-32 truncate text-sm font-medium">{{ product.name }}</span>
              <div class="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full rounded-full bg-blue-500 transition-all"
                  :style="`width: ${product.percentage}%;`"
                />
              </div>
              <span class="w-16 text-right text-sm font-medium">{{ product.count }} รายการ</span>
            </div>
            <div
              v-if="productStats.length === 0"
              class="py-4 text-center text-gray-500"
            >
              ยังไม่มีข้อมูลการดำเนินการ
            </div>
          </div>
        </div>
      </Card>

      <!-- Target Achievement by Product -->
      <Card>
        <div class="p-4">
          <h3 class="mb-4 text-lg font-bold">
            การบรรลุเป้าหมายตามสินค้า
          </h3>
          <div class="space-y-3">
            <div
              v-for="item in productAchievementStats"
              :key="item.productId"
              class="flex items-center gap-4"
            >
              <span class="w-32 truncate text-sm font-medium">{{ item.productName }}</span>
              <div class="h-4 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div
                  class="h-full rounded-full transition-all"
                  :class="item.isAchieved ? 'bg-green-500' : 'bg-amber-500'"
                  :style="`width: ${item.percentage}%;`"
                />
              </div>
              <span class="w-24 text-right text-sm font-medium">
                {{ item.achieved }} / {{ item.target }}
              </span>
              <Badge
                :color="item.isAchieved ? 'success' : 'warning'"
                variant="subtle"
                class="w-20 justify-center"
              >
                {{ item.isAchieved ? 'บรรลุ' : 'ยังไม่บรรลุ' }}
              </Badge>
            </div>
            <div
              v-if="productAchievementStats.length === 0"
              class="py-4 text-center text-gray-500"
            >
              ยังไม่มีเป้าหมายสินค้า
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Target Achievement by Zone and Product -->
    <div>
      <h3 class="mb-4 text-lg font-bold">
        การบรรลุเป้าหมายตามเขตและสินค้า
      </h3>
      <div class="space-y-6">
        <div class="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-4">
          <Card
            v-for="zone in zoneProductAchievementStats"
            :key="zone.zoneId"
          >
            <!-- Zone Header -->
            <div class="mb-3 flex items-center justify-between">
              <Badge
                variant="subtle"
                class="text-white"
                :style="`background-color: ${zone.zoneColor};`"
              >
                {{ zone.zoneName }}
              </Badge>
              <span class="text-sm text-gray-500">
                บรรลุ {{ zone.achievedCount }} / {{ zone.totalCount }} สินค้า
              </span>
            </div>
            <!-- Products in Zone -->
            <div class="space-y-2">
              <div
                v-for="product in zone.products"
                :key="product.productId"
                class="flex items-center gap-3"
              >
                <span class="w-28 truncate text-sm">{{ product.productName }}</span>
                <div class="h-3 flex-1 overflow-hidden rounded-full bg-gray-200">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="product.isAchieved ? 'bg-green-500' : 'bg-amber-500'"
                    :style="`width: ${product.percentage}%;`"
                  />
                </div>
                <span class="w-16 text-right text-xs text-gray-600">
                  {{ product.achieved }} / {{ product.target }}
                </span>
                <Icon
                  :name="product.isAchieved ? 'i-heroicons-check-circle' : 'i-heroicons-clock'"
                  :class="product.isAchieved ? 'text-green-500' : 'text-amber-500'"
                  class="size-5"
                />
              </div>
            </div>
          </Card>
          <div
            v-if="zoneProductAchievementStats.length === 0"
            class="py-4 text-center text-gray-500"
          >
            ยังไม่มีข้อมูลการดำเนินการ
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { PROJECT_PROGRESS_STATUS, PROJECT_PROGRESS_STATUS_LABEL, getStatusColor } from '~/constants/config'

const project = useProjectsPageLoader()
const zoneLoader = useZonePageLoader()

const stats = computed(() => {
  const progresses = project.find.item?.project_progresses || []
  const uniqueCustomers = new Set(progresses.map((p) => p.customer_id))

  return {
    totalProducts: project.find.item?.project_targets?.length || 0,
    totalProgress: progresses.length,
    totalSchedules: project.find.item?.project_schedules?.length || 0,
    totalCustomers: uniqueCustomers.size,
  }
})

const statusStats = computed(() => {
  const progresses = project.find.item?.project_progresses || []

  return Object.values(PROJECT_PROGRESS_STATUS).map((status) => ({
    key: status,
    label: PROJECT_PROGRESS_STATUS_LABEL[status],
    count: progresses.filter((p) => p.status === status).length,
    color: getStatusColor(status),
  }))
})

const zoneStats = computed(() => {
  const progresses = project.find.item?.project_progresses || []
  const zones = zoneLoader.fetch.items
  const maxCount = Math.max(...zones.map((z) => progresses.filter((p) => p.zone_id === z.id).length), 1)

  return zones.map((zone) => {
    const count = progresses.filter((p) => p.zone_id === zone.id).length

    return {
      id: zone.id,
      name: zone.name,
      color: zone.color,
      count,
      percentage: (count / maxCount) * 100,
    }
  }).sort((a, b) => b.count - a.count)
})

const productStats = computed(() => {
  const progresses = project.find.item?.project_progresses || []
  const productMap = new Map<string, { id: string
    name: string
    count: number }>()

  progresses.forEach((p) => {
    if (p.products) {
      const existing = productMap.get(p.product_id)

      if (existing) {
        existing.count++
      } else {
        productMap.set(p.product_id, {
          id: p.product_id,
          name: p.products.name,
          count: 1,
        })
      }
    }
  })

  const products = Array.from(productMap.values())
  const maxCount = Math.max(...products.map((p) => p.count), 1)

  return products.map((product) => ({
    ...product,
    percentage: (product.count / maxCount) * 100,
  })).sort((a, b) => b.count - a.count)
})

// Achievement stats by product (non-rejected progress counts as achieved)
const productAchievementStats = computed(() => {
  const targets = project.find.item?.project_targets || []
  const progresses = project.find.item?.project_progresses || []

  return targets.map((target) => {
    const achievedCount = progresses.filter(
      (p) => p.product_id === target.product_id
        && p.status !== PROJECT_PROGRESS_STATUS.REJECTED
        && p.status !== PROJECT_PROGRESS_STATUS.PLAN_IN,
    ).length

    const targetAmount = (target.amount || 0) * zoneLoader.fetch.items.length
    const isAchieved = achievedCount >= targetAmount
    const percentage = targetAmount > 0 ? Math.min((achievedCount / targetAmount) * 100, 100) : 0

    return {
      productId: target.product_id,
      productName: target.products?.name || '-',
      target: targetAmount,
      achieved: achievedCount,
      isAchieved,
      percentage,
    }
  }).sort((a, b) => b.percentage - a.percentage)
})

// Achievement stats by zone and product (grouped by zone)
// แสดงการบรรลุเป้าหมายแยกตามเขตและสินค้า
const zoneProductAchievementStats = computed(() => {
  const targets = project.find.item?.project_targets || []
  const progresses = project.find.item?.project_progresses || []
  const zones = zoneLoader.fetch.items

  return zones.map((zone) => {
    const products = targets.map((target) => {
      const achievedCount = progresses.filter(
        (p) => p.zone_id === zone.id
          && p.product_id === target.product_id
          && p.status !== PROJECT_PROGRESS_STATUS.REJECTED
          && p.status !== PROJECT_PROGRESS_STATUS.PLAN_IN,
      ).length

      const targetAmount = target.amount || 0
      const isAchieved = achievedCount >= targetAmount
      const percentage = targetAmount > 0 ? Math.min((achievedCount / targetAmount) * 100, 100) : 0

      return {
        productId: target.product_id,
        productName: target.products?.name || '-',
        target: targetAmount,
        achieved: achievedCount,
        isAchieved,
        percentage,
      }
    }).sort((a, b) => b.percentage - a.percentage)

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      zoneColor: zone.color,
      products,
      achievedCount: products.filter((p) => p.isAchieved).length,
      totalCount: products.length,
    }
  }).sort((a, b) => b.achievedCount - a.achievedCount)
})
</script>
