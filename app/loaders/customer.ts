export interface ICustomer {
  id: string
  name: string
  province_id?: number
  provinces?: {
    id: number
    name_th: string
  } | null
  created_at: string
}

export const useCustomerPageLoader = () => {
  return usePageLoader<ICustomer>({
    baseURL: '/customers',
    getBaseRequestOptions: () => {
      return {
        params: {
          select: '*, provinces:progression_provinces(*)',
          order: 'id.desc',
        },
        adapter: createSupabaseAdapter(['name', 'provinces.name_th']),
      }
    },
  })
}
