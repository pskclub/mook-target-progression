export interface IZoneProvince {
  id: number
  name_th: string
}

export interface IZone {
  id: string
  name: string
  color: string
  provinces?: IZoneProvince[]
}

export const useZonePageLoader = defineStore('zone', () => {
  return usePageLoader<IZone>({
    baseURL: '/zones',
    getBaseRequestOptions: () => {
      return {
        params: {
          select: '*, provinces:progression_provinces(*)',
          order: 'id.desc',
        },
        adapter: createSupabaseAdapter(['name']),
      }
    },
  })
})
