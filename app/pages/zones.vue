<template>
  <div>
    <Table
      :options="tableOptions"
      @pageChange="zone.fetchPageChange"
      @search="zone.fetchSearch"
    />
  </div>
</template>

<script lang="ts" setup>
import { routes } from '~/constants/routes'

useHead({
  title: routes.zones.label,
})

useApp().definePage({
  title: routes.zones.label,
})

const zone = useZonePageLoader()

const tableOptions = useTable({
  repo: zone,
  columns: () => [
    {
      accessorKey: 'name',
      header: 'Name',
      type: COLUMN_TYPES.TEXT,
    },
    {
      accessorKey: 'created_at',
      header: 'Created at',
      type: COLUMN_TYPES.DATE,
      meta: {
        class: {
          th: 'text-right w-[50px]',
          td: 'text-right w-[50px]',
        },
      },
    },
  ],
})

zone.fetchSetLoading()
onMounted(() => {
  zone.fetchPage()
})
</script>
