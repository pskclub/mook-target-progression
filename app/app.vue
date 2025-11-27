<template>
  <App
    :toaster="{
      position: 'top-right',
      progress: false,
    }"
  >
    <DashboardGroup>
      <DashboardSidebar
        v-model:collapsed="collapsed"
        collapsible
        class="bg-white"
        :ui="{
          footer: 'border-t border-default',
          root: collapsed ? '' : 'w-[250px]',
        }"
      >
        <template #header="{ collapsed }">
          <div class="flex w-full items-center justify-center">
            <img
              v-if="collapsed"
              src="/favicon.ico"
              alt=""
              class="w-[30px]&quot;"
            />
            <img
              v-else
              src="/logo.png"
              alt="Mook Progression"
              class="h-[50px]"
            />
          </div>
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
      <DashboardPanel
        :ui="{
          body: 'p-0 sm:p-0',
        }"
      >
        <template #header>
          <DashboardNavbar
            :ui="{
              title: 'text-3xl',
            }"
            :title="app.pageMeta.title"
          >
            <template #leading>
              <DashboardSidebarCollapse />
            </template>

            <template #right>
              <div id="header-right" />
            </template>
          </DashboardNavbar>
        </template>
        <template #body>
          <Breadcrumb
            v-if="
              !app.pageMeta.isHideBreadcrumbs && ArrayHelper.toArray(app.pageMeta.breadcrumbs).length > 0
                && app.pageMeta.breadcrumbs!.length > 1
            "
            :items="app.pageMeta.breadcrumbs"
            class="mb-5"
            :ui="{
              item: 'max-w-2/3',
              list: 'w-full',
            }"
          />
          <NuxtPage />
        </template>
      </DashboardPanel>
    </DashboardGroup>
  </App>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const app = useApp()
const collapsed = ref(false)
const items: NavigationMenuItem[][] = [[
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
