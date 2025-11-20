export const useZonePageLoader = () => {
  return usePageLoader<any>({
    baseURL: '/zones',
    getBaseRequestOptions: () => {
      return {
        params: {
          select:
            '*',
          order: 'id.desc',
        },
        adapter: createSupabaseAdapter(['name', 'code']),
      }
    },
  })
}
