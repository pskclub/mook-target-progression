import type { IProjectProgress, IProjectTarget } from './project-detail'

export interface IProject {
  id: number
  name: string
  created_at: string
  project_targets?: IProjectTarget[]
  project_progresses?: IProjectProgress[]
  project_schedules?: IProjectSchedule[]
}

export const useProjectsPageLoader = defineStore('projects', () => {
  return usePageLoader<IProject>({
    baseURL: '/projects',
    getBaseRequestOptions: () => {
      return {
        params: {
          select:
            '*',
          order: 'id.desc',
        },
        adapter: createSupabaseAdapter(['name']),
      }
    },
    find: {
      getRequestOptions: () => {
        return {
          params: {
            select: '*, project_targets(*, products(*)), project_progresses(*, products(*), zones(*), customers(*)), project_schedules(*, products(*), zones(*), customers(*))',
          },
        }
      },
    },
  })
})

export const useProjectDetail = () => {
  const project = useProjectsPageLoader()
  const products = computed<IProduct[]>(() => {
    const uniqueProducts = ArrayHelper.toArray(project.find.item?.project_progresses).reduce((acc, target) => {
      if (target.products && !acc.some((p) => p.id === target.products!.id)) {
        acc.push(target.products)
      }

      return acc
    }, [] as IProduct[])

    return uniqueProducts.sort((a: IProduct, b: IProduct) => a.name.localeCompare(b.name))
  })

  const customers = computed<ICustomer[]>(() => {
    const uniqueCustomers = ArrayHelper.toArray(project.find.item?.project_progresses).reduce((acc, target) => {
      if (target.customers && !acc.some((c) => c.id === target.customers!.id)) {
        acc.push(target.customers)
      }

      return acc
    }, [] as ICustomer[])

    return uniqueCustomers.sort((a: ICustomer, b: ICustomer) => a.name.localeCompare(b.name))
  })

  const scheduleProducts = computed<IProduct[]>(() => {
    const uniqueProducts = ArrayHelper.toArray(project.find.item?.project_schedules).reduce((acc, target) => {
      if (target.products && !acc.some((p) => p.id === target.products!.id)) {
        acc.push(target.products)
      }

      return acc
    }, [] as IProduct[])

    return uniqueProducts.sort((a: IProduct, b: IProduct) => a.name.localeCompare(b.name))
  })

  const scheduleCustomers = computed<ICustomer[]>(() => {
    const uniqueCustomers = ArrayHelper.toArray(project.find.item?.project_schedules).reduce((acc, target) => {
      if (target.customers && !acc.some((c) => c.id === target.customers!.id)) {
        acc.push(target.customers)
      }

      return acc
    }, [] as ICustomer[])

    return uniqueCustomers.sort((a: ICustomer, b: ICustomer) => a.name.localeCompare(b.name))
  })

  return {
    products,
    customers,
    scheduleProducts,
    scheduleCustomers,
  }
}
