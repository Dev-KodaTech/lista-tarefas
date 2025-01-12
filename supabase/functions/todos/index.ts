/// <reference path="../types.d.ts" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors.js'

interface Todo {
  id?: number
  text: string
  completed: boolean
  date?: string
  time?: string
  category: string
  note?: string
  repeat?: 'daily' | 'weekly' | 'monthly' | null
  user_id: string
}

serve(async (req: RequestWithMethod) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
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

    const url = new URL(req.url)
    const path = url.pathname.split('/').pop()

    // GET /todos - List todos
    if (req.method === 'GET' && !path) {
      const { data, error } = await supabaseClient
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /todos - Create todo
    if (req.method === 'POST') {
      const { text, category, date, time, note, repeat } = await req.json()
      
      const todo: Todo = {
        text,
        category,
        completed: false,
        date,
        time,
        note,
        repeat,
        user_id: user.id,
      }

      const { data, error } = await supabaseClient
        .from('todos')
        .insert([todo])
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // PATCH /todos/:id - Update todo
    if (req.method === 'PATCH' && path) {
      const id = parseInt(path)
      const updates = await req.json()

      const { data, error } = await supabaseClient
        .from('todos')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // DELETE /todos/:id - Delete todo
    if (req.method === 'DELETE' && path) {
      const id = parseInt(path)

      const { error } = await supabaseClient
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 