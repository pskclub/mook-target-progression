<template>
  <App
    :toaster="{
      position: 'top-right',
      progress: false,
    }"
  >
    <div class="flex">
      <DashboardSidebar
        class="w-[300px] bg-white"
        :ui="{ footer: 'border-t border-default' }"
      >
        <template #header>
          <p class="text-xl font-bold">
            Mook Progression
          </p>
        </template>

        <template #default="{ collapsed }">
          <NavigationMenu
            :collapsed="collapsed"
            :items="items[0]"
            orientation="vertical"
          />

          <NavigationMenu
            :collapsed="collapsed"
            :items="items[1]"
            orientation="vertical"
            class="mt-auto"
          />
        </template>
      </DashboardSidebar>
      <div class="w-full overflow-x-scroll bg-gray-50">
        <main
          :class="[
            'mx-auto min-h-full w-full flex-1 px-6 py-10 lg:px-8',
          ]"
        >
          <Breadcrumb
            v-if="
              !app.pageMeta.isHideBreadcrumbs && app.pageMeta.breadcrumbs?.length > 1
            "
            :items="app.pageMeta.breadcrumbs"
            class="mb-5"
            :ui="{
              item: 'max-w-2/3',
              list: 'w-full',
            }"
          />
          <div
            v-if="app.pageMeta.title"
            class="mb-4 flex flex-col justify-between gap-1 md:mb-6 md:gap-4 lg:flex-row lg:items-start"
          >
            <div class="flex flex-1 flex-col">
              <h1
                class="text-3xl font-bold wrap-break-word lg:max-w-2/3"
                :title="app.pageMeta.title"
              >
                {{ app.pageMeta.title }}
                <span id="page-title-extra" />
              </h1>

              <div id="page-subtitle" />
              <p
                v-if="app.pageMeta.sub_title"
                class="text-[#475467]"
              >
                {{ app.pageMeta.sub_title }}
              </p>
            </div>
            <div id="page-header" />
          </div>
          <NuxtPage />
        </main>
      </div>
    </div>
  </App>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const app = useApp()

const items: NavigationMenuItem[][] = [[{
  label: 'Dashboard',
  icon: 'i-lucide-house',
  to: '/',
},
{
  label: 'Projects',
  icon: 'i-lucide-inbox',
  to: '/projects',
},
{
  label: 'Settings',
  icon: 'i-lucide-settings',
  defaultOpen: true,
  children: [
    {
      label: 'Zones',
      to: '/zones',
    },
    {
      label: 'Products',
      to: '/products',
    },
    {
      label: 'Customers',
      to: '/customers',
    },
  ],
}]]
</script>
