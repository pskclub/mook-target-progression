export interface IProvince {
  id: number
  name_th: string
  name_en: string
  geography_id: number
  created_at: string
  updated_at: string
  zone_id?: string | null
}

export const useProvincePageLoader = () => {
  return usePageLoader<IProvince>({
    baseURL: '/provinces',
    getBaseRequestOptions: () => {
      return {
        params: {
          select: '*',
          order: 'name_th.asc',
        },
        adapter: createSupabaseAdapter(['name_th', 'name_en']),
      }
    },
  })
}
