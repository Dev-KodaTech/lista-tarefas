/// <reference path="../types.d.ts" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from '@supabase/supabase-js'
import { corsHeaders } from '../_shared/cors'

interface TaskAttachment {
  id?: number
  todo_id: number
  file_path: string
  file_name: string
  file_size: number
  file_type: string
  user_id: string
}

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    return new Error(String(maybeError))
  }
}

function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message
}

serve(async (request: Request) => {
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

    // GET /attachments/:todo_id - List attachments for a todo
    if (request.method === 'GET' && path) {
      const todoId = parseInt(path)

      const { data, error } = await supabaseClient
        .from('task_attachments')
        .select('*')
        .eq('todo_id', todoId)
        .eq('user_id', user.id)

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // POST /attachments - Upload attachment
    if (request.method === 'POST') {
      const formData = await request.formData()
      const file = formData.get('file') as File
      const todoId = parseInt(formData.get('todo_id') as string)

      if (!file || !todoId) {
        throw new Error('File and todo_id are required')
      }

      // Upload file to storage
      const filePath = `task-attachments/${user.id}/${todoId}/${file.name}`
      const { error: uploadError } = await supabaseClient.storage
        .from('task-attachments')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Create attachment record
      const attachment: TaskAttachment = {
        todo_id: todoId,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        user_id: user.id,
      }

      const { data, error } = await supabaseClient
        .from('task_attachments')
        .insert([attachment])
        .select()
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      })
    }

    // DELETE /attachments/:id - Delete attachment
    if (request.method === 'DELETE' && path) {
      const id = parseInt(path)

      // Get attachment details
      const { data: attachment, error: fetchError } = await supabaseClient
        .from('task_attachments')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (fetchError) throw fetchError

      if (!attachment) {
        return new Response(JSON.stringify({ error: 'Attachment not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        })
      }

      // Delete file from storage
      const { error: storageError } = await supabaseClient.storage
        .from('task-attachments')
        .remove([attachment.file_path])

      if (storageError) throw storageError

      // Delete attachment record
      const { error } = await supabaseClient
        .from('task_attachments')
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
  } catch (error) {
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
}) 