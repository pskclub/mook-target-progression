import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse } from 'axios'
import { insforge } from '../utils/insforge'

interface InsforgeAdapterConfig extends AxiosRequestConfig {
  params?: {
    select?: string
    order?: string
    page?: number
    limit?: number
    q?: string
    search?: Record<string, any>
    [key: string]: any
  }
}

interface IQueryResult {
  data: any[] | null
  error: any
  count: number | null
}

/**
 * Creates an InsForge adapter for Axios that handles pagination and search
 * @param searchColumns - Array of column names to search in when using the 'q' parameter
 * @returns AxiosAdapter
 */
export const createSupabaseAdapter = (
  searchColumns: string[] = ['name', 'description'],
): AxiosAdapter => {
  return async (config: InsforgeAdapterConfig): Promise<AxiosResponse> => {
    const {
      url = '', params = {}, method = 'GET', data,
    } = config

    // Extract table name from URL and add progression_ prefix
    const pathName = url.split('/').pop() as string
    const tableName = `progression_${pathName}`

    // Initialize query with select statement
    let query = insforge.database.from(tableName).select(params.select || '*', {
      count: 'exact',
    })

    // Handle search query (q parameter)
    if (params.q) {
      const searchQuery = params.q.trim()

      if (searchQuery) {
        const searchConditions = searchColumns
          .map((column) => `${column}.ilike.%${searchQuery}%`)
          .join(',')

        query = query.or(searchConditions)
      }
    }

    // Handle advanced search (search parameter)
    if (params.search) {
      Object.entries(params.search).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle array values (e.g., multiple values for a column)
          query = query.in(key, value)
        } else if (typeof value === 'string') {
          // Handle partial match for strings
          if (value) {
            query = query.ilike(key, `%${value}%`)
          }
        } else {
          // Handle exact match for other types
          if (value !== undefined) {
            query = query.eq(key, value)
          }
        }
      })
    }

    // Apply filters (excluding special parameters)
    Object.entries(params).forEach(([key, value]) => {
      if (!['select', 'order', 'page', 'limit', 'q', 'search'].includes(key)) {
        query = query.eq(key, value)
      }
    })

    // Apply ordering if specified
    if (params.order) {
      const parts = params.order.split('.')
      const column = parts[0] as string
      const direction = parts[1]

      query = query.order(column, {
        ascending: direction === 'asc',
      })
    }

    let result: IQueryResult = {
      data: null,
      error: null,
      count: null,
    }

    // Handle different loader types based on method and parameters
    if (method.toLowerCase() === 'get' && params.id) {
      // ObjectLoader case for GET
      const tableWithoutId = url.split('/')[1] || pathName
      const getTableName = `progression_${tableWithoutId}`
      const result = await insforge.database
        .from(getTableName)
        .select(params.select)
        .eq('id', params.id)

      return {
        data: result.data?.[0] || null,
        status: 200,
        statusText: 'OK',
        headers: config.headers as any,
        config,
      }
    } else if (method.toLowerCase() === 'get') {
      if (params.page && params.limit) {
        // PageLoader case
        const page = params.page || 1
        const limit = params.limit || 10
        const offset = (page - 1) * limit

        result = await query.range(offset, offset + limit - 1)

        return {
          data: {
            items: result.data || [],
            total: result.count || 0,
            limit,
          },
          status: 200,
          statusText: 'OK',
          headers: config.headers as any,
          config,
        }
      }

      // ListLoader case
      result = await query

      return {
        data: result.data || [],
        status: 200,
        statusText: 'OK',
        headers: config.headers as any,
        config,
      }
    } else if (method.toLowerCase() === 'post') {
      // ObjectLoader case for POST
      result = await insforge.database.from(tableName).insert(JSON.parse(data)).select()

      return {
        data: result.data?.[0] || null,
        status: 200,
        statusText: 'OK',
        headers: config.headers as any,
        config,
      }
    } else if (method.toLowerCase() === 'put') {
      // ObjectLoader case for PUT
      const tableWithoutId = url.split('/')[1] || pathName
      const updateTableName = `progression_${tableWithoutId}`
      result = await insforge.database
        .from(updateTableName)
        .update(JSON.parse(data))
        .eq('id', pathName)
        .select()

      return {
        data: result.data?.[0] || null,
        status: 200,
        statusText: 'OK',
        headers: config.headers as any,
        config,
      }
    } else if (method.toLowerCase() === 'delete') {
      // ObjectLoader case for DELETE
      const tableWithoutId = url.split('/')[1] || pathName
      const deleteTableName = `progression_${tableWithoutId}`
      result = await insforge.database.from(deleteTableName).delete().eq('id', pathName)

      return {
        data: result.data?.[0] || null,
        status: 200,
        statusText: 'OK',
        headers: config.headers as any,
        config,
      }
    }

    throw new Error(`Unsupported method: ${method}`)
  }
}
