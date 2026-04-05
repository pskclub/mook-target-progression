<template>
  <div class="space-y-4">
    <!-- Summary Stats -->
    <div class="grid grid-cols-4 gap-3">
      <Card class="text-center">
        <div class="p-3">
          <p class="text-2xl font-bold text-indigo-600">
            {{ totalStats.zones }}
          </p>
          <p class="text-xs text-gray-500">
            เขต
          </p>
        </div>
      </Card>
      <Card class="text-center">
        <div class="p-3">
          <p class="text-2xl font-bold text-teal-600">
            {{ totalStats.provinces }}
          </p>
          <p class="text-xs text-gray-500">
            จังหวัด
          </p>
        </div>
      </Card>
      <Card class="text-center">
        <div class="p-3">
          <p class="text-2xl font-bold text-orange-500">
            {{ totalStats.customers }}
          </p>
          <p class="text-xs text-gray-500">
            ลูกค้า
          </p>
        </div>
      </Card>
      <Card class="text-center">
        <div class="p-3">
          <p class="text-2xl font-bold text-violet-600">
            {{ totalStats.products }}
          </p>
          <p class="text-xs text-gray-500">
            สินค้า
          </p>
        </div>
      </Card>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Thailand SVG Map -->
      <div class="space-y-2">
        <!-- Mode toggle -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs text-gray-400">แสดงผล:</span>
          <button
            v-for="mode in mapModes"
            :key="mode.value"
            class="rounded-full px-3 py-1 text-xs font-medium transition-colors"
            :class="mapMode === mode.value
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
            @click="mapMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>

        <!-- Map container -->
        <div class="relative">
          <!-- Tooltip -->
          <div
            v-if="hoveredProvince"
            class="pointer-events-none fixed z-50 rounded-lg border bg-white px-3 py-2 shadow-lg"
            :style="tooltipStyle"
          >
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold">
                {{ hoveredProvince.name_th }}
              </p>
              <p
                v-if="hoveredProvince.zone"
                class="rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                :style="`background-color: ${hoveredProvince.zone.color}`"
              >
                {{ hoveredProvince.zone.name }}
              </p>
            </div>
            <div class="mt-1.5 grid grid-cols-3 gap-2 text-center">
              <div>
                <p class="text-base font-bold text-orange-500">
                  {{ hoveredProvince.customerCount }}
                </p>
                <p class="text-[10px] text-gray-400">
                  ลูกค้า
                </p>
              </div>
              <div>
                <p class="text-base font-bold text-blue-500">
                  {{ hoveredProvince.progressCount }}
                </p>
                <p class="text-[10px] text-gray-400">
                  รายการ
                </p>
              </div>
              <div>
                <p class="text-base font-bold text-violet-500">
                  {{ hoveredProvince.products.length }}
                </p>
                <p class="text-[10px] text-gray-400">
                  สินค้า
                </p>
              </div>
            </div>
            <div
              v-if="hoveredProvince.products.length > 0"
              class="mt-1.5 flex flex-wrap gap-1 border-t pt-1.5"
            >
              <span
                v-for="prod in hoveredProvince.products.slice(0, 4)"
                :key="prod.id"
                class="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700"
              >
                {{ prod.name }} ×{{ prod.count }}
              </span>
            </div>
          </div>

          <svg
            :viewBox="mapViewBox"
            class="h-auto w-full"
            xmlns="http://www.w3.org/2000/svg"
            @mousemove="onMapMouseMove"
          >
            <path
              v-for="loc in mapLocations"
              :key="loc.id"
              :d="loc.path"
              :fill="getProvinceColor(loc.name)"
              :fill-opacity="getProvinceFillOpacity(loc.name)"
              :opacity="getProvinceOpacity(loc.name)"
              stroke="white"
              stroke-width="1"
              class="transition-all"
              :class="getProvinceCursor(loc.name)"
              @click="onProvinceClick(loc.name)"
              @mouseenter="onProvinceHover(loc.name)"
              @mouseleave="hoveredProvince = null"
            />
          </svg>
        </div>

        <!-- Density legend (shown in non-zone modes) -->
        <div
          v-if="mapMode !== 'zone'"
          class="px-2"
        >
          <div
            class="h-3 w-full rounded-full"
            :style="`background: linear-gradient(to right, ${densityLegend.emptyColor}, ${densityLegend.fullColor})`"
          />
          <div class="mt-1 flex justify-between text-[10px] text-gray-400">
            <span>0 {{ densityLegend.unit }}</span>
            <span>{{ densityLegend.label }}</span>
            <span>{{ densityLegend.maxValue }} {{ densityLegend.unit }}</span>
          </div>
        </div>
      </div>

      <!-- Right Panel -->
      <div
        class="space-y-3"
      >
        <!-- Breadcrumb -->
        <div class="flex items-center gap-1 text-sm">
          <button
            class="font-medium text-indigo-600 hover:underline"
            @click="clearSelection"
          >
            ทั้งหมด
          </button>
          <template v-if="selectedZone">
            <Icon
              name="i-heroicons-chevron-right"
              class="size-3 text-gray-400"
            />
            <button
              class="font-medium hover:underline"
              :style="`color: ${selectedZone.color}`"
              @click="selectedProvinceName = null"
            >
              {{ selectedZone.name }}
            </button>
          </template>
          <template v-if="selectedProvinceName">
            <Icon
              name="i-heroicons-chevron-right"
              class="size-3 text-gray-400"
            />
            <span class="font-medium text-gray-700">{{ selectedProvinceName }}</span>
          </template>
        </div>

        <!-- Panel: No selection → Zone legend + overall product stats -->
        <div
          v-if="!selectedZone"
          class="space-y-4"
        >
          <!-- Product overall stats -->
          <div>
            <p class="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
              สถิติสินค้าทั้งโครงการ
            </p>
            <div class="space-y-2">
              <div
                v-for="prod in overallProductStats"
                :key="prod.id"
                class="flex items-center gap-2"
              >
                <span class="w-28 truncate text-xs font-medium text-gray-700">{{ prod.name }}</span>
                <div class="h-3 flex-1 rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-violet-500 transition-all"
                    :style="`width: ${prod.percentage}%`"
                  />
                </div>
                <span class="w-16 text-right text-xs text-gray-500">
                  {{ prod.achieved }}/{{ prod.target }}
                </span>
                <Badge
                  :color="prod.isAchieved ? 'success' : 'warning'"
                  variant="subtle"
                  class="w-12 justify-center text-[10px]"
                >
                  {{ prod.percentage.toFixed(0) }}%
                </Badge>
              </div>
              <div
                v-if="overallProductStats.length === 0"
                class="py-2 text-center text-xs text-gray-400"
              >
                ยังไม่มีเป้าหมายสินค้า
              </div>
            </div>
          </div>

          <div class="border-t pt-3">
            <p class="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
              เขตทั้งหมด — คลิกจังหวัดบนแผนที่หรือเลือกเขต
            </p>
            <div class="space-y-2">
              <div
                v-for="zone in zoneLegend"
                :key="zone.id"
                class="cursor-pointer rounded-lg border p-3 transition-colors hover:bg-gray-50"
                :style="`border-left: 4px solid ${zone.color}`"
                @click="filterByZone(zone.id)"
              >
                <div class="mb-2 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium">{{ zone.name }}</span>
                    <span class="text-xs text-gray-400">{{ zone.provinceCount }} จว.</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-center">
                      <p
                        class="text-sm font-bold"
                        :style="`color: ${zone.color}`"
                      >
                        {{ zone.customerCount }}
                      </p>
                      <p class="text-[10px] text-gray-400">
                        ลูกค้า
                      </p>
                    </div>
                    <div class="text-center">
                      <p
                        class="text-sm font-bold"
                        :style="`color: ${zone.color}`"
                      >
                        {{ zone.progressCount }}
                      </p>
                      <p class="text-[10px] text-gray-400">
                        รายการ
                      </p>
                    </div>
                    <Icon
                      name="i-heroicons-chevron-right"
                      class="size-4 text-gray-300"
                    />
                  </div>
                </div>
                <!-- Mini product bars per zone -->
                <div class="space-y-1">
                  <div
                    v-for="prod in zone.productStats"
                    :key="prod.id"
                    class="flex items-center gap-1.5"
                  >
                    <span class="w-20 truncate text-[10px] text-gray-500">{{ prod.name }}</span>
                    <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        class="h-full rounded-full transition-all"
                        :class="prod.isAchieved ? 'bg-green-500' : 'bg-violet-400'"
                        :style="`width: ${prod.percentage}%`"
                      />
                    </div>
                    <span class="w-10 text-right text-[10px] text-gray-400">
                      {{ prod.achieved }}/{{ prod.target }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel: Zone selected → Province list + product stats -->
        <div
          v-else-if="selectedZone && !selectedProvinceName"
          class="space-y-4"
        >
          <!-- Zone product achievement -->
          <div>
            <div class="mb-2 flex items-center justify-between">
              <p class="text-xs font-medium tracking-wide text-gray-400 uppercase">
                สินค้าในเขต{{ selectedZone.name }}
              </p>
              <button
                class="text-xs text-gray-400 hover:text-gray-600"
                @click="clearSelection"
              >
                ← กลับ
              </button>
            </div>
            <div class="space-y-2">
              <div
                v-for="prod in selectedZoneProductStats"
                :key="prod.id"
                class="flex items-center gap-2"
              >
                <span class="w-28 truncate text-xs font-medium text-gray-700">{{ prod.name }}</span>
                <div class="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="prod.isAchieved ? 'bg-green-500' : 'bg-violet-500'"
                    :style="`width: ${prod.percentage}%`"
                  />
                </div>
                <span class="w-14 text-right text-xs text-gray-500">
                  {{ prod.achieved }}/{{ prod.target }}
                </span>
                <Badge
                  :color="prod.isAchieved ? 'success' : 'warning'"
                  variant="subtle"
                  class="w-12 justify-center text-[10px]"
                >
                  {{ prod.percentage.toFixed(0) }}%
                </Badge>
              </div>
            </div>
          </div>

          <!-- Province list -->
          <div class="border-t pt-3">
            <p class="mb-2 text-xs font-medium tracking-wide text-gray-400 uppercase">
              จังหวัดใน{{ selectedZone.name }}
            </p>
            <div class="space-y-1.5">
              <div
                v-for="prov in selectedZoneProvinces"
                :key="prov.id"
                class="flex items-center justify-between rounded-lg border p-2.5 transition-colors"
                :class="prov.customerCount > 0 ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default opacity-50'"
                @click="prov.customerCount > 0 && onProvinceClick(prov.name_th)"
              >
                <span class="text-sm font-medium">{{ prov.name_th }}</span>
                <div class="flex items-center gap-2">
                  <div class="flex gap-1">
                    <Badge
                      v-for="prod in prov.topProducts"
                      :key="prod.id"
                      variant="subtle"
                      color="neutral"
                      class="text-[10px]"
                    >
                      {{ prod.name }} {{ prod.count }}
                    </Badge>
                  </div>
                  <div class="w-8 text-right">
                    <p
                      class="text-sm font-bold"
                      :style="`color: ${selectedZone.color}`"
                    >
                      {{ prov.customerCount }}
                    </p>
                    <p class="text-[10px] text-gray-400">
                      ลูกค้า
                    </p>
                  </div>
                  <Icon
                    v-if="prov.customerCount > 0"
                    name="i-heroicons-chevron-right"
                    class="size-4 text-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel: Province selected → Customer list with products -->
        <div
          v-else-if="selectedProvinceName"
          class="space-y-2"
        >
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium tracking-wide text-gray-400 uppercase">
              ลูกค้าใน{{ selectedProvinceName }}
            </p>
            <button
              class="text-xs text-gray-400 hover:text-gray-600"
              @click="selectedProvinceName = null"
            >
              ← กลับ
            </button>
          </div>

          <div
            v-for="customer in selectedProvinceCustomers"
            :key="customer.id"
            class="rounded-lg border p-3"
          >
            <!-- Customer header -->
            <div class="mb-2 flex items-center gap-2">
              <div
                class="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                :style="`background-color: ${selectedZone?.color}`"
              >
                {{ customer.name.charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold">
                  {{ customer.name }}
                </p>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="s in customer.statusStats.filter(x => x.count > 0)"
                    :key="s.key"
                    :color="s.color"
                    variant="subtle"
                    class="text-[10px]"
                  >
                    {{ s.count }} {{ s.label }}
                  </Badge>
                </div>
              </div>
              <span class="text-sm font-bold text-gray-600">{{ customer.progressCount }}</span>
            </div>
            <!-- Customer product breakdown -->
            <div class="space-y-1 border-t pt-2">
              <div
                v-for="prod in customer.products"
                :key="prod.id"
                class="flex items-center gap-2"
              >
                <span class="w-24 truncate text-[11px] text-gray-600">{{ prod.name }}</span>
                <div class="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div
                    class="h-full rounded-full bg-violet-400 transition-all"
                    :style="`width: ${prod.barWidth}%`"
                  />
                </div>
                <Badge
                  :color="getStatusColor(prod.topStatus)"
                  variant="subtle"
                  class="text-[10px]"
                >
                  {{ prod.count }}
                </Badge>
              </div>
            </div>
          </div>

          <div
            v-if="selectedProvinceCustomers.length === 0"
            class="py-6 text-center text-sm text-gray-400"
          >
            ไม่มีลูกค้าในจังหวัดนี้
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import ThailandMap from '@svg-maps/thailand'
import { PROJECT_PROGRESS_STATUS, PROJECT_PROGRESS_STATUS_LABEL, getStatusColor } from '~/constants/config'

const project = useProjectsPageLoader()
const zoneLoader = useZonePageLoader()

const mapViewBox = ThailandMap.viewBox
const mapLocations = ThailandMap.locations

const englishToThai: Record<string, string> = {
  'Bangkok': 'กรุงเทพมหานคร',
  'Samut Prakan': 'สมุทรปราการ',
  'Nonthaburi': 'นนทบุรี',
  'Pathum Thani': 'ปทุมธานี',
  'Phra Nakhon Si Ayutthaya': 'พระนครศรีอยุธยา',
  'Ang Thong': 'อ่างทอง',
  'Lop Buri': 'ลพบุรี',
  'Sing Buri': 'สิงห์บุรี',
  'Chai Nat': 'ชัยนาท',
  'Saraburi': 'สระบุรี',
  'Chon Buri': 'ชลบุรี',
  'Rayong': 'ระยอง',
  'Chanthaburi': 'จันทบุรี',
  'Trat': 'ตราด',
  'Chachoengsao': 'ฉะเชิงเทรา',
  'Prachin Buri': 'ปราจีนบุรี',
  'Nakhon Nayok': 'นครนายก',
  'Sa Kaeo': 'สระแก้ว',
  'Nakhon Ratchasima': 'นครราชสีมา',
  'Buriram': 'บุรีรัมย์',
  'Surin': 'สุรินทร์',
  'Si Sa Ket': 'ศรีสะเกษ',
  'Ubon Ratchathani': 'อุบลราชธานี',
  'Yasothon': 'ยโสธร',
  'Chaiyaphum': 'ชัยภูมิ',
  'Amnat Charoen': 'อำนาจเจริญ',
  'Bueng Kan': 'บึงกาฬ',
  'Nong Bua Lam Phu': 'หนองบัวลำภู',
  'Khon Kaen': 'ขอนแก่น',
  'Udon Thani': 'อุดรธานี',
  'Loei': 'เลย',
  'Nong Khai': 'หนองคาย',
  'Maha Sarakham': 'มหาสารคาม',
  'Roi Et': 'ร้อยเอ็ด',
  'Kalasin': 'กาฬสินธุ์',
  'Sakon Nakhon': 'สกลนคร',
  'Nakhon Phanom': 'นครพนม',
  'Mukdahan': 'มุกดาหาร',
  'Chiang Mai': 'เชียงใหม่',
  'Lamphun': 'ลำพูน',
  'Lampang': 'ลำปาง',
  'Uttaradit': 'อุตรดิตถ์',
  'Phrae': 'แพร่',
  'Nan': 'น่าน',
  'Phayao': 'พะเยา',
  'Chiang Rai': 'เชียงราย',
  'Mae Hong Son': 'แม่ฮ่องสอน',
  'Nakhon Sawan': 'นครสวรรค์',
  'Uthai Thani': 'อุทัยธานี',
  'Kamphaeng Phet': 'กำแพงเพชร',
  'Tak': 'ตาก',
  'Sukhothai': 'สุโขทัย',
  'Phitsanulok': 'พิษณุโลก',
  'Phichit': 'พิจิตร',
  'Phetchabun': 'เพชรบูรณ์',
  'Ratchaburi': 'ราชบุรี',
  'Kanchanaburi': 'กาญจนบุรี',
  'Suphan Buri': 'สุพรรณบุรี',
  'Nakhon Pathom': 'นครปฐม',
  'Samut Sakhon': 'สมุทรสาคร',
  'Samut Songkhram': 'สมุทรสงคราม',
  'Phetchaburi': 'เพชรบุรี',
  'Prachuap Khiri Khan': 'ประจวบคีรีขันธ์',
  'Nakhon Si Thammarat': 'นครศรีธรรมราช',
  'Krabi': 'กระบี่',
  'Phangnga': 'พังงา',
  'Phuket': 'ภูเก็ต',
  'Surat Thani': 'สุราษฎร์ธานี',
  'Ranong': 'ระนอง',
  'Chumphon': 'ชุมพร',
  'Songkhla': 'สงขลา',
  'Satun': 'สตูล',
  'Trang': 'ตรัง',
  'Phatthalung': 'พัทลุง',
  'Pattani': 'ปัตตานี',
  'Yala': 'ยะลา',
  'Narathiwat': 'นราธิวาส',
}

const progresses = computed(() => project.find.item?.project_progresses || [])
const targets = computed(() => project.find.item?.project_targets || [])

// ---- province helpers ----
const provinceZoneMap = computed(() => {
  const map = new Map<string, typeof zoneLoader.fetch.items[0]>()

  for (const zone of zoneLoader.fetch.items) {
    for (const prov of zone.provinces || []) {
      map.set(prov.name_th, zone)
    }
  }

  return map
})

const customersByProvince = computed(() => {
  const map = new Map<string, Set<string>>()

  for (const p of progresses.value) {
    const name = getProvNameTh(p)
    if (!name) continue
    if (!map.has(name)) map.set(name, new Set())
    map.get(name)!.add(p.customer_id)
  }

  return map
})

const getProvNameTh = (p: typeof progresses.value[0]): string | undefined => {
  const nameFromNested = (p.customers as any)?.provinces?.name_th as string | undefined
  if (nameFromNested) return nameFromNested
  const id = (p.customers as any)?.province_id as number | undefined
  if (!id) return undefined

  for (const zone of zoneLoader.fetch.items) {
    const found = zone.provinces?.find((pv) => pv.id === id)
    if (found) return found.name_th
  }

  return undefined
}

// ---- map mode ----
type MapMode = 'zone' | 'customers' | 'progress' | 'products'

const mapMode = ref<MapMode>('zone')

const mapModes: { value: MapMode
  label: string }[] = [
  {
    value: 'zone',
    label: 'เขต',
  },
  {
    value: 'customers',
    label: 'ลูกค้า',
  },
  {
    value: 'progress',
    label: 'รายการ',
  },
  {
    value: 'products',
    label: 'สินค้า',
  },
]

// ---- province value map for density ----
const provinceValueMap = computed(() => {
  const map = new Map<string, number>()

  for (const p of progresses.value) {
    const name = getProvNameTh(p)
    if (!name) continue

    if (mapMode.value === 'customers') {
      if (!map.has(name)) map.set(name, 0)
      // will recalculate using customersByProvince below
    } else if (mapMode.value === 'progress') {
      map.set(name, (map.get(name) ?? 0) + 1)
    } else if (mapMode.value === 'products') {
      // count unique products per province
      const key = `${name}::${p.product_id}`
      if (!map.has(key)) map.set(name, (map.get(name) ?? 0) + 1)
    }
  }

  if (mapMode.value === 'customers') {
    for (const [name, ids] of customersByProvince.value) {
      map.set(name, ids.size)
    }
  }

  return map
})

const maxProvinceValue = computed(() => {
  if (mapMode.value === 'zone') return 1

  return Math.max(...Array.from(provinceValueMap.value.values()), 1)
})

const densityModeConfig: Record<Exclude<MapMode, 'zone'>, { emptyColor: string
  fullColor: string
  unit: string
  label: string }> = {
  customers: {
    emptyColor: '#fef3c7',
    fullColor: '#f97316',
    unit: 'ราย',
    label: 'ความหนาแน่นลูกค้า',
  },
  progress: {
    emptyColor: '#dbeafe',
    fullColor: '#2563eb',
    unit: 'รายการ',
    label: 'ความหนาแน่นรายการ',
  },
  products: {
    emptyColor: '#ede9fe',
    fullColor: '#7c3aed',
    unit: 'สินค้า',
    label: 'ความหนาแน่นสินค้า',
  },
}

const densityLegend = computed(() => {
  if (mapMode.value === 'zone') return {
    emptyColor: '',
    fullColor: '',
    unit: '',
    label: '',
    maxValue: 0,
  }
  const cfg = densityModeConfig[mapMode.value]

  return {
    ...cfg,
    maxValue: maxProvinceValue.value,
  }
})

// ---- map color/opacity ----
const getProvinceColor = (svgName: string): string => {
  const thaiName = englishToThai[svgName]
  if (!thaiName) return '#e5e7eb'
  const zone = provinceZoneMap.value.get(thaiName)
  if (!zone) return '#e5e7eb'

  if (mapMode.value !== 'zone') {
    return densityModeConfig[mapMode.value].fullColor
  }

  if (selectedZone.value && selectedZone.value.id !== zone.id) return `${zone.color}40`

  return zone.color
}

const getProvinceFillOpacity = (svgName: string): number => {
  if (mapMode.value === 'zone') return 1
  const thaiName = englishToThai[svgName]
  if (!thaiName) return 0.08
  const value = provinceValueMap.value.get(thaiName) ?? 0
  if (value === 0) return 0.08

  return 0.15 + (value / maxProvinceValue.value) * 0.85
}

const getProvinceOpacity = (svgName: string): number => {
  if (!selectedProvinceName.value) return 1
  const thaiName = englishToThai[svgName]

  return thaiName === selectedProvinceName.value ? 1 : 0.4
}

const getProvinceCursor = (svgName: string): string => {
  const thaiName = englishToThai[svgName]
  if (!thaiName) return 'cursor-default'

  return customersByProvince.value.has(thaiName) ? 'cursor-pointer' : 'cursor-default'
}

// ---- summary stats ----
const totalStats = computed(() => {
  const zones = zoneLoader.fetch.items

  return {
    zones: zones.length,
    provinces: zones.reduce((s, z) => s + (z.provinces?.length || 0), 0),
    customers: new Set(progresses.value.map((p) => p.customer_id)).size,
    products: targets.value.length,
  }
})

// ---- overall product stats (all zones combined) ----
const overallProductStats = computed(() => {
  const totalZones = zoneLoader.fetch.items.length || 1

  return targets.value.map((t) => {
    const target = (t.amount || 0) * totalZones
    const achieved = progresses.value.filter(
      (p) => p.product_id === t.product_id
        && p.status !== PROJECT_PROGRESS_STATUS.REJECTED
        && p.status !== PROJECT_PROGRESS_STATUS.PLAN_IN,
    ).length

    const percentage = target > 0 ? Math.min((achieved / target) * 100, 100) : 0

    return {
      id: t.product_id,
      name: t.products?.name || '-',
      target,
      achieved,
      percentage,
      isAchieved: achieved >= target,
    }
  }).sort((a, b) => b.percentage - a.percentage)
})

// ---- product stats for a given zone ----
const buildZoneProductStats = (zoneId: string) => {
  return targets.value.map((t) => {
    const target = t.amount || 0
    const achieved = progresses.value.filter(
      (p) => p.zone_id === zoneId
        && p.product_id === t.product_id
        && p.status !== PROJECT_PROGRESS_STATUS.REJECTED
        && p.status !== PROJECT_PROGRESS_STATUS.PLAN_IN,
    ).length

    const percentage = target > 0 ? Math.min((achieved / target) * 100, 100) : 0

    return {
      id: t.product_id,
      name: t.products?.name || '-',
      target,
      achieved,
      percentage,
      isAchieved: achieved >= target,
    }
  }).sort((a, b) => b.percentage - a.percentage)
}

// ---- zone legend ----
const zoneLegend = computed(() => {
  return zoneLoader.fetch.items.map((zone) => {
    const zoneProgs = progresses.value.filter((p) => p.zone_id === zone.id)

    return {
      ...zone,
      provinceCount: zone.provinces?.length || 0,
      progressCount: zoneProgs.length,
      customerCount: new Set(zoneProgs.map((p) => p.customer_id)).size,
      productStats: buildZoneProductStats(zone.id),
    }
  })
})

// ---- selection ----
const selectedZoneId = ref<string | null>(null)
const selectedProvinceName = ref<string | null>(null)

const selectedZone = computed(() =>
  selectedZoneId.value
    ? zoneLoader.fetch.items.find((z) => z.id === selectedZoneId.value) ?? null
    : null,
)

// ---- zone product stats ----
const selectedZoneProductStats = computed(() =>
  selectedZoneId.value ? buildZoneProductStats(selectedZoneId.value) : [],
)

// ---- province list for selected zone ----
const selectedZoneProvinces = computed(() => {
  if (!selectedZone.value) return []

  return (selectedZone.value.provinces || []).map((prov) => {
    const provProgs = progresses.value.filter(
      (p) => p.zone_id === selectedZone.value!.id && getProvNameTh(p) === prov.name_th,
    )

    // top products by count (max 2 badges)
    const productCountMap = new Map<string, { id: string
      name: string
      count: number }>()

    for (const p of provProgs) {
      if (!p.products) continue
      const existing = productCountMap.get(p.product_id)
      if (existing) existing.count++
      else productCountMap.set(p.product_id, {
        id: p.product_id,
        name: p.products.name,
        count: 1,
      })
    }

    const topProducts = Array.from(productCountMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)

    return {
      ...prov,
      customerCount: customersByProvince.value.get(prov.name_th)?.size ?? 0,
      progressCount: provProgs.length,
      topProducts,
    }
  }).sort((a, b) => b.customerCount - a.customerCount)
})

// ---- customer list for selected province ----
const selectedProvinceCustomers = computed(() => {
  if (!selectedProvinceName.value || !selectedZone.value) return []
  const provName = selectedProvinceName.value

  const provProgs = progresses.value.filter(
    (p) => p.zone_id === selectedZone.value!.id && getProvNameTh(p) === provName,
  )

  type CustomerEntry = {
    id: string
    name: string
    progressCount: number
    statusCounts: Record<string, number>
    productCounts: Map<string, { id: string
      name: string
      count: number
      statusCounts: Record<string, number> }>
  }

  const customerMap = new Map<string, CustomerEntry>()

  for (const p of provProgs) {
    if (!p.customers) continue
    const existing = customerMap.get(p.customer_id)

    if (existing) {
      existing.progressCount++
      existing.statusCounts[p.status] = (existing.statusCounts[p.status] || 0) + 1
      const prodEntry = existing.productCounts.get(p.product_id)

      if (prodEntry) {
        prodEntry.count++
        prodEntry.statusCounts[p.status] = (prodEntry.statusCounts[p.status] || 0) + 1
      } else {
        existing.productCounts.set(p.product_id, {
          id: p.product_id,
          name: p.products?.name || '-',
          count: 1,
          statusCounts: {
            [p.status]: 1,
          },
        })
      }
    } else {
      customerMap.set(p.customer_id, {
        id: p.customer_id,
        name: (p.customers as any).name || '-',
        progressCount: 1,
        statusCounts: {
          [p.status]: 1,
        },
        productCounts: new Map([[p.product_id, {
          id: p.product_id,
          name: p.products?.name || '-',
          count: 1,
          statusCounts: {
            [p.status]: 1,
          },
        }]]),
      })
    }
  }

  const customerMaxCount = Math.max(...Array.from(customerMap.values()).map((c) => c.progressCount), 1)

  return Array.from(customerMap.values()).map((c) => ({
    ...c,
    statusStats: Object.values(PROJECT_PROGRESS_STATUS).map((status) => ({
      key: status,
      label: PROJECT_PROGRESS_STATUS_LABEL[status],
      count: c.statusCounts[status] || 0,
      color: getStatusColor(status),
    })),
    products: Array.from(c.productCounts.values())
      .sort((a, b) => b.count - a.count)
      .map((prod) => {
        const topStatus = Object.entries(prod.statusCounts)
          .sort((a, b) => b[1] - a[1])[0]?.[0] || PROJECT_PROGRESS_STATUS.PENDING

        return {
          ...prod,
          topStatus,
          barWidth: (prod.count / customerMaxCount) * 100,
        }
      }),
  })).sort((a, b) => b.progressCount - a.progressCount)
})

// ---- mouse tracking ----
const mouseX = ref(0)
const mouseY = ref(0)

const onMapMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
}

const tooltipStyle = computed(() => {
  const offset = 14
  const tooltipW = 200
  const tooltipH = 120
  const x = mouseX.value + offset + tooltipW > window.innerWidth
    ? mouseX.value - tooltipW - offset
    : mouseX.value + offset

  const y = mouseY.value + offset + tooltipH > window.innerHeight
    ? mouseY.value - tooltipH - offset
    : mouseY.value + offset

  return `left: ${x}px; top: ${y}px;`
})

// ---- hover ----
const hoveredProvince = ref<{
  name_th: string
  zone: typeof zoneLoader.fetch.items[0] | null
  customerCount: number
  progressCount: number
  products: { id: string
    name: string
    count: number }[]
} | null>(null)

const onProvinceHover = (svgName: string) => {
  const thaiName = englishToThai[svgName]

  if (!thaiName) {
    hoveredProvince.value = null

    return
  }

  const zone = provinceZoneMap.value.get(thaiName) ?? null
  const provProgs = progresses.value.filter((p) => getProvNameTh(p) === thaiName)

  const productMap = new Map<string, { id: string
    name: string
    count: number }>()

  for (const p of provProgs) {
    if (!p.products) continue
    const existing = productMap.get(p.product_id)
    if (existing) existing.count++
    else productMap.set(p.product_id, {
      id: p.product_id,
      name: p.products.name,
      count: 1,
    })
  }

  hoveredProvince.value = {
    name_th: thaiName,
    zone,
    customerCount: customersByProvince.value.get(thaiName)?.size ?? 0,
    progressCount: provProgs.length,
    products: Array.from(productMap.values()).sort((a, b) => b.count - a.count),
  }
}

// ---- interactions ----
const onProvinceClick = (nameOrEnglish: string) => {
  const thaiName = englishToThai[nameOrEnglish] ?? nameOrEnglish
  const zone = provinceZoneMap.value.get(thaiName)
  if (!zone) return
  selectedZoneId.value = zone.id
  selectedProvinceName.value = thaiName
}

const filterByZone = (zoneId: string) => {
  selectedZoneId.value = zoneId
  selectedProvinceName.value = null
}

const clearSelection = () => {
  selectedZoneId.value = null
  selectedProvinceName.value = null
}
</script>
