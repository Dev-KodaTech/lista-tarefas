import { SupabaseClient } from '@supabase/supabase-js'
import { PaginationParams, SearchParams, TodoStats, BatchOperation } from '../types/shared'

export function applyPagination(query: any, params: PaginationParams) {
  const { page = 1, limit = 10, order = 'created_at', direction = 'desc' } = params
  const offset = (page - 1) * limit

  return query
    .order(order, { ascending: direction === 'asc' })
    .range(offset, offset + limit - 1)
}

export function applySearch(query: any, params: SearchParams) {
  const { query: searchQuery, category, status, priority, startDate, endDate } = params

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
  }

  if (category) {
    query = query.eq('category_id', category)
  }

  if (status) {
    query = query.eq('completed', status === 'completed')
  }

  if (priority) {
    query = query.eq('priority', priority)
  }

  if (startDate) {
    query = query.gte('date', startDate)
  }

  if (endDate) {
    query = query.lte('date', endDate)
  }

  return query
}

export async function getTodoStats(
  supabase: SupabaseClient,
  userId: string
): Promise<TodoStats> {
  const today = new Date().toISOString().split('T')[0]

  // Get total count
  const { count: total } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get completed count
  const { count: completed } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', true)

  // Get overdue count
  const { count: overdue } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', false)
    .lt('date', today)

  // Get today's count
  const { count: todayCount } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('date', today)

  // Get upcoming count
  const { count: upcomingCount } = await supabase
    .from('todos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('completed', false)
    .gt('date', today)

  interface CategoryData {
    category_id: number
    categories: {
      name: string
    }
  }

  // Get counts by category
  const { data: categoryData } = await supabase
    .from('categories')
    .select('id, name, todos!inner(id)')
    .eq('todos.user_id', userId)

  const byCategory: Record<string, number> = {}
  categoryData?.forEach((category) => {
    if (category.name && category.todos) {
      byCategory[category.name] = category.todos.length
    }
  })

  // Get counts by priority
  const { data: priorityData } = await supabase
    .from('todos')
    .select('priority')
    .eq('user_id', userId)

  const byPriority: Record<string, number> = {}
  priorityData?.forEach((todo) => {
    if (todo.priority) {
      byPriority[todo.priority] = (byPriority[todo.priority] || 0) + 1
    }
  })

  return {
    total: total || 0,
    completed: completed || 0,
    pending: (total || 0) - (completed || 0),
    overdue: overdue || 0,
    todayCount: todayCount || 0,
    upcomingCount: upcomingCount || 0,
    byCategory,
    byPriority,
  }
}

export async function processBatchOperation<T extends { id?: number }>(
  supabase: SupabaseClient,
  table: string,
  userId: string,
  operation: BatchOperation<T>['operation'],
  items: T[]
) {
  switch (operation) {
    case 'create':
      const { data: created, error: createError } = await supabase
        .from(table)
        .insert(items.map((item) => ({ ...item, user_id: userId })))
        .select()

      if (createError) throw createError
      return created

    case 'update':
      const updates = items.map(async (item) => {
        const { id, ...updateData } = item
        const { data, error } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', id)
          .eq('user_id', userId)
          .select()

        if (error) throw error
        return data?.[0]
      })

      return await Promise.all(updates)

    case 'delete':
      const { data: deleted, error: deleteError } = await supabase
        .from(table)
        .delete()
        .in(
          'id',
          items.map((item) => item.id)
        )
        .eq('user_id', userId)
        .select()

      if (deleteError) throw deleteError
      return deleted

    default:
      throw new Error(`Invalid operation: ${operation}`)
  }
} 