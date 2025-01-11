-- Create storage bucket for task attachments
insert into storage.buckets (id, name, public)
values ('task-attachments', 'task-attachments', false);

-- Enable storage RLS
alter table storage.objects enable row level security;

-- Storage Policies for task-attachments bucket
create policy "Users can view their own task attachments"
    on storage.objects for select
    using (
        bucket_id = 'task-attachments' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can upload their own task attachments"
    on storage.objects for insert
    with check (
        bucket_id = 'task-attachments' 
        and auth.uid()::text = (storage.foldername(name))[1]
        and (storage.foldername(name))[1] is not null
    );

create policy "Users can update their own task attachments"
    on storage.objects for update
    using (
        bucket_id = 'task-attachments' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

create policy "Users can delete their own task attachments"
    on storage.objects for delete
    using (
        bucket_id = 'task-attachments' 
        and auth.uid()::text = (storage.foldername(name))[1]
    );

-- Additional table for task attachments
create table public.task_attachments (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    todo_id bigint references public.todos(id) on delete cascade not null,
    file_path text not null,
    file_name text not null,
    file_size bigint not null,
    file_type text not null,
    user_id uuid references auth.users(id) on delete cascade not null
);

-- Enable RLS on task_attachments
alter table public.task_attachments enable row level security;

-- Policies for task_attachments
create policy "Users can view their own task attachments metadata"
    on public.task_attachments for select
    using (auth.uid() = user_id);

create policy "Users can insert their own task attachments metadata"
    on public.task_attachments for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own task attachments metadata"
    on public.task_attachments for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own task attachments metadata"
    on public.task_attachments for delete
    using (auth.uid() = user_id);

-- Create index for task_attachments
create index task_attachments_todo_id_idx on public.task_attachments(todo_id);
create index task_attachments_user_id_idx on public.task_attachments(user_id);

-- Additional policies for enhanced security
-- Prevent users from accessing completed todos after 30 days
create policy "Users can only view completed todos within 30 days"
    on public.todos for select
    using (
        auth.uid() = user_id
        and (
            not completed
            or (completed and created_at > (now() - interval '30 days'))
        )
    );

-- Rate limiting function for todo creation
create or replace function public.check_todo_rate_limit()
returns trigger as $$
declare
    todo_count int;
begin
    -- Count todos created in the last hour
    select count(*)
    into todo_count
    from public.todos
    where user_id = auth.uid()
    and created_at > (now() - interval '1 hour');

    -- Limit to 100 todos per hour
    if todo_count >= 100 then
        raise exception 'Rate limit exceeded: Maximum 100 todos per hour.';
    end if;

    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for rate limiting
create trigger check_todo_rate_limit_trigger
    before insert on public.todos
    for each row
    execute procedure public.check_todo_rate_limit();

-- Function to clean up old completed todos
create or replace function public.cleanup_old_completed_todos()
returns void as $$
begin
    -- Delete completed todos older than 30 days
    delete from public.todos
    where completed = true
    and created_at < (now() - interval '30 days');
end;
$$ language plpgsql security definer;

-- Create a scheduled job to run cleanup (needs to be run manually in Supabase dashboard)
comment on function public.cleanup_old_completed_todos() is
'Scheduled function that runs daily to clean up completed todos older than 30 days'; 