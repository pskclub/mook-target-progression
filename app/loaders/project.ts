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
    }
  })
})
