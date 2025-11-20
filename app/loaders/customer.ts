export interface ICustomer {
  id: string
  name: string
  created_at: string
}

export const useCustomerPageLoader = () => {
  return usePageLoader<ICustomer>({
    baseURL: '/customers',
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
