export interface IZone {
  id: string
  name: string
  color: string
}

export const useZonePageLoader = defineStore('zone', () => {
  return usePageLoader<IZone>({
    baseURL: '/zones',
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
  })
})
