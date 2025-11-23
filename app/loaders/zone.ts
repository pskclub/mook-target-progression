export interface IZone {
  id: string
  name: string
}

export const useZonePageLoader = () => {
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
}
