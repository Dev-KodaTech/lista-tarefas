/// <reference path="../types.d.ts" />
import { serve, DenoRequest } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors'
import { applyPagination, applySearch, getTodoStats, processBatchOperation } from '../utils/query'
import { PaginationParams, SearchParams, BatchOperation } from '../types/shared'

serve(async (request: DenoRequest) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: request.headers.get('Authorization')! },
        },
      }
    )

    // Get user ID from session
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    const url = new URL(request.url)
    const path = url.pathname.split('/').pop()

    // GET /todos-advanced/search - Search todos with pagination and filters
    if (request.method === 'GET' && path === 'search') {
      const searchParams = Object.fromEntries(url.searchParams) as unknown as SearchParams
      const paginationParams = Object.fromEntries(url.searchParams) as unknown as PaginationParams

      let query = supabaseClient
        .from('todos')
        .select('*')
        .eq('user_id', user.id)

      query = applySearch(query, searchParams)
      query = applyPagination(query, paginationParams)

      const { data, error } = await query

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /todos-advanced/stats - Get todo statistics
    if (request.method === 'GET' && path === 'stats') {
      const stats = await getTodoStats(supabaseClient, user.id)

      return new Response(JSON.stringify({ data: stats }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /todos-advanced/overdue - Get overdue todos
    if (request.method === 'GET' && path === 'overdue') {
      const { data, error } = await supabaseClient
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .lt('date', new Date().toISOString())
        .order('date', { ascending: true })

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /todos-advanced/today - Get today's todos
    if (request.method === 'GET' && path === 'today') {
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabaseClient
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // GET /todos-advanced/upcoming - Get upcoming todos
    if (request.method === 'GET' && path === 'upcoming') {
      const { data, error } = await supabaseClient
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .gt('date', new Date().toISOString())
        .order('date', { ascending: true })

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /todos-advanced/batch - Batch operations
    if (request.method === 'POST' && path === 'batch') {
      const { operation, items } = await request.json() as BatchOperation<any>
      
      const result = await processBatchOperation(
        supabaseClient,
        'todos',
        user.id,
        operation,
        items
      )

      return new Response(JSON.stringify({ data: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /todos-advanced/reorder - Reorder todos
    if (request.method === 'POST' && path === 'reorder') {
      const { items } = await request.json() as { items: { id: number; position: number }[] }
      
      const updates = items.map(async (item) => {
        return await supabaseClient
          .from('todos')
          .update({ position: item.position })
          .eq('id', item.id)
          .eq('user_id', user.id)
      })

      await Promise.all(updates)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 