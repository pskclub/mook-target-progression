export interface IProjectProgress {
  id: number
  product_id: string
  zone_id: string
  customer_id: string
  status: string
  description: string
  created_at: string
  products?: { name: string }
  zones?: { name: string }
  customers?: { name: string }
}

export interface IProjectTarget {
  id: number
  product_id: string
  zone_id: string
  amount: number
  created_at: string
  products?: IProduct
}

export interface IProjectSchedule {
  id: string
  zone_id: string
  customer_id: string
  product_id: string
  description: string
  date: string
  created_at: string
  products?: { name: string }
  zones?: { name: string }
  customers?: { name: string }
}

// Note: กำหนดการ (Schedule) uses the same project_progresses table
export const useProjectProgressLoader = (_projectId: string) => {
  return usePageLoader<IProjectProgress>({
    baseURL: '/project_progresses',
    getBaseRequestOptions: () => {
      return {
        params: {
          select: '*, products(name), zones(name), customers(name)',
          order: 'created_at.desc',
        },
        adapter: createSupabaseAdapter(['products.name', 'zones.name', 'customers.name']),
      }
    },
  })
}

export const useProjectTargetLoader = (_projectId: string) => {
  return usePageLoader<IProjectTarget>({
    baseURL: '/project_targets',
    getBaseRequestOptions: () => {
      return {
        params: {
          select: '*, products(name)',
          order: 'id.desc',
        },
        adapter: createSupabaseAdapter(['products.name']),
      }
    },
  })
}

export const useProjectScheduleLoader = (_projectId: string) => {
  return usePageLoader<IProjectSchedule>({
    baseURL: '/project_schedules',
    getBaseRequestOptions: () => {
      return {
        params: {
          select: '*, products(name), zones(name), customers(name)',
          order: 'date.asc',
        },
        adapter: createSupabaseAdapter(['products.name', 'zones.name', 'customers.name']),
      }
    },
  })
}
