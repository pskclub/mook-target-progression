<template>
  <div>
    <TeleportSafe to="#header-right">
      <div>
        <Button
          trailing-icon="ph:plus"
          @click="onAdd"
        >
          เพิ่ม Zone
        </Button>
      </div>
    </TeleportSafe>
    <Table
      :options="tableOptions"
      @pageChange="zone.fetchPageChange"
      @search="zone.fetchSearch"
    >
      <template #color-cell="{ row }">
        <div class="flex items-center gap-2">
          <div
            class="h-4 w-4 rounded-full border border-gray-200"
            :style="{ backgroundColor: row.original.color || 'transparent' }"
          />
          <span v-if="row.original.color">{{ row.original.color }}</span>
          <span
            v-else
            class="text-gray-400"
          >-</span>
        </div>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex justify-end">
          <ButtonActionIcon
            icon="ph:pencil-simple"
            color="neutral"
            @click="onEdit(row.original)"
          />
          <!-- <ButtonActionIcon
            icon="ph:trash"
            color="error"
            @click="onDelete(row.original)"
          /> -->
        </div>
      </template>
    </Table>
  </div>
</template>

<script lang="ts" setup>
import { routes } from '~/constants/routes'
import FormModal from '~/components/Zone/FormModal.vue'
import { insforge } from '~/utils/insforge'

useHead({
  title: routes.zones.label,
})

useApp().definePage({
  title: routes.zones.label,
})

const zone = useZonePageLoader()
const overlay = useOverlay()
const dialog = useDialog()
const noti = useNotification()
const editModal = overlay.create(FormModal)
const addModal = overlay.create(FormModal)

const tableOptions = useTable({
  repo: zone,
  columns: () => [
    {
      accessorKey: 'name',
      header: 'Name',
      type: COLUMN_TYPES.TEXT,
    },
    {
      accessorKey: 'color',
      header: 'Color',
      type: COLUMN_TYPES.TEXT,
    },
    {
      accessorKey: 'created_at',
      header: 'Created at',
      type: COLUMN_TYPES.DATE,
      meta: {
        class: {
          th: 'text-right w-[150px]',
          td: 'text-right w-[150px]',
        },
      },
    },
    {
      accessorKey: 'actions',
      header: '',
      meta: {
        class: {
          th: 'text-right w-[100px]',
          td: 'text-right w-[100px]',
        },
      },
    },
  ],
})

// Function to update provinces mapping directly via InsForge SDK
const updateProvincesMapping = async (zoneId: string, provinceIds: number[]) => {
  try {
    // 1. Unlink all provinces from this zone
    await insforge.database
      .from('progression_provinces')
      .update({
        zone_id: null,
      })
      .eq('zone_id', zoneId)

    // 2. Link newly selected provinces
    if (provinceIds.length > 0) {
      await insforge.database
        .from('progression_provinces')
        .update({
          zone_id: zoneId,
        })
        .in('id', provinceIds)
    }
  } catch (err) {
    console.error('Failed to update provinces mapping', err)
  }
}

const onEdit = async (values: any) => {
  // Fetch currently mapped provinces for this zone
  const {
    data,
  } = await insforge.database
    .from('progression_provinces')
    .select('id')
    .eq('zone_id', values.id)

  const selectedIds = data?.map((p) => p.id) || []

  editModal.open({
    isEditing: true,
    values: values,
    selectedIds,
    status: () => zone.update.status,
    onSubmit: async (payload: any, selectedProvinces: number[]) => {
      // First, trigger record update via loader
      await zone.updateRun(values.id, {
        data: payload,
      })

      // Next, manually update provinces
      await updateProvincesMapping(values.id, selectedProvinces)
    },
  })
}

const onAdd = () => {
  addModal.open({
    status: () => zone.add.status,
    selectedIds: [],
    onSubmit: async (payload: any, selectedProvinces: number[]) => {
      // Use SDK directly to get inserted record ID for mapping
      const {
        data, error,
      } = await insforge.database
        .from('progression_zones')
        .insert(payload)
        .select()
        .single()

      if (error) {
        noti.error({
          title: 'เพิ่ม Zone ไม่สำเร็จ',
          description: 'เกิดข้อผิดพลาดในการเพิ่ม Zone',
        })

        return
      }

      const zoneId = data.id

      if (selectedProvinces && selectedProvinces.length > 0) {
        await updateProvincesMapping(zoneId, selectedProvinces)
      }

      addModal.close()
      zone.fetchPage()
      noti.success({
        title: 'เพิ่ม Zone สำเร็จ',
        description: 'คุณได้เพิ่ม Zone เรียบร้อยแล้ว',
      })
    },
  })
}

const onDelete = (values: any) => {
  dialog
    .confirm({
      title: 'ยืนยันการลบ',
      description: `คุณต้องการลบ Zone "${values.name}" หรือไม่?`,
      confirmText: 'ยืนยัน',
      cancelText: 'ยกเลิก',
      type: DialogType.ERROR,
    })
    .then(async () => {
      dialog.loading({
        title: 'กรุณารอสักครู่...',
        description: 'กำลังส่งข้อมูล...',
      })

      // 1. Unlink provinces before deleting to preserve ON DELETE SET NULL relation (or handled automatically if defined in DB schema)
      // Since we added ON DELETE SET NULL, it should cascade the null implicitly, but just to be safe:
      zone.deleteRun(values.id)
    })
}

zone.fetchSetLoading()
onMounted(() => {
  zone.fetchPage()
})

useWatchTrue(
  () => zone.update.status.isSuccess,
  () => {
    editModal.close()
    zone.fetchPage()

    noti.success({
      title: 'แก้ไข Zone สำเร็จ',
      description: 'คุณได้แก้ไข Zone เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => zone.update.status.isError,
  () => {
    editModal.close()
    dialog.close()
    noti.error({
      title: 'แก้ไข Zone ไม่สำเร็จ',
      description: StringHelper.getError(
        zone.update.status.errorData,
        'เกิดข้อผิดพลาดในการแก้ไข Zone กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)

useWatchTrue(
  () => zone.delete.status.isSuccess,
  () => {
    editModal.close()
    zone.fetchPage()
    dialog.close()
    noti.success({
      title: 'ลบ Zone สำเร็จ',
      description: 'คุณได้ลบ Zone เรียบร้อยแล้ว',
    })
  },
)

useWatchTrue(
  () => zone.delete.status.isError,
  () => {
    dialog.close()
    noti.error({
      title: 'ลบ Zone ไม่สำเร็จ',
      description: StringHelper.getError(
        zone.delete.status.errorData,
        'เกิดข้อผิดพลาดในการลบ Zone กรุณาลองใหม่อีกครั้ง',
      ),
    })
  },
)
</script>
