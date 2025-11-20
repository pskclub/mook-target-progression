import type { IProjectProgress, IProjectTarget } from './project-detail'

export interface IProject {
  id: number
  name: string
  created_at: string
  project_targets?: IProjectTarget[]
  project_progresses?: IProjectProgress[]
}

export const useProjectsPageLoader = () => {
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
  })
}
