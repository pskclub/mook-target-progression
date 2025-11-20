export interface IProduct {
  id: string
  name: string
  created_at: string
}

export const useProductsPageLoader = () => {
  return usePageLoader<IProduct>({
    baseURL: '/products',
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
