-- Add columns to todos if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'priority') then
        alter table public.todos add column priority text check (priority in ('high', 'medium', 'low'));
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'labels') then
        alter table public.todos add column labels text[] default '{}';
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'description') then
        alter table public.todos add column description text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'due_time') then
        alter table public.todos add column due_time time without time zone;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'reminder_time') then
        alter table public.todos add column reminder_time timestamp with time zone;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'parent_id') then
        alter table public.todos add column parent_id bigint references public.todos(id) on delete cascade;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'position') then
        alter table public.todos add column position integer default 0;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'is_recurring') then
        alter table public.todos add column is_recurring boolean default false;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'recurrence_pattern') then
        alter table public.todos add column recurrence_pattern jsonb;
    end if;
end $$;

-- Add full text search if it doesn't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'todos' and column_name = 'search_vector') then
        alter table public.todos add column search_vector tsvector
        generated always as (
            setweight(to_tsvector('english', coalesce(text, '')), 'A') ||
            setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
            setweight(to_tsvector('english', coalesce(note, '')), 'C')
        ) stored;

        create index if not exists todos_search_idx on public.todos using gin(search_vector);
    end if;
end $$;

-- Create indexes if they don't exist
create index if not exists todos_parent_id_idx on public.todos(parent_id);
create index if not exists todos_labels_idx on public.todos using gin(labels);
create index if not exists todos_position_idx on public.todos(position);
create index if not exists todos_reminder_time_idx on public.todos(reminder_time);

-- Create notifications table if it doesn't exist
create table if not exists public.notifications (
    id bigint generated by default as identity primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    user_id uuid references auth.users(id) on delete cascade not null,
    todo_id bigint references public.todos(id) on delete cascade,
    type text not null check (type in ('due_soon', 'overdue', 'completed', 'reminder', 'daily_digest', 'weekly_report')),
    title text not null,
    message text not null,
    read boolean default false,
    metadata jsonb default '{}'::jsonb
);

-- Create user preferences table if it doesn't exist
create table if not exists public.user_preferences (
    user_id uuid references auth.users(id) on delete cascade primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    email_notifications boolean default true,
    push_notifications boolean default true,
    reminder_time integer default 30,
    overdue_notifications boolean default true,
    daily_digest boolean default false,
    weekly_report boolean default false,
    theme text default 'light',
    time_zone text default 'UTC',
    date_format text default 'YYYY-MM-DD',
    time_format text default '24h',
    start_of_week integer default 0,
    default_view text default 'list',
    settings jsonb default '{}'::jsonb
);

-- Enable RLS on new tables
alter table public.notifications enable row level security;
alter table public.user_preferences enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;
drop policy if exists "Users can view their own preferences" on public.user_preferences;
drop policy if exists "Users can update their own preferences" on public.user_preferences;
drop policy if exists "Users can insert their own preferences" on public.user_preferences;

-- Create policies for notifications
create policy "Users can view their own notifications"
    on public.notifications for select
    using (auth.uid() = user_id);

create policy "Users can update their own notifications"
    on public.notifications for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

-- Create policies for user preferences
create policy "Users can view their own preferences"
    on public.user_preferences for select
    using (auth.uid() = user_id);

create policy "Users can update their own preferences"
    on public.user_preferences for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can insert their own preferences"
    on public.user_preferences for insert
    with check (auth.uid() = user_id);

-- Drop existing functions if they exist
drop function if exists public.cleanup_old_notifications();
drop function if exists public.generate_daily_digest();
drop function if exists public.generate_weekly_report();

-- Create utility functions
create or replace function public.cleanup_old_notifications()
returns void as $$
begin
    delete from public.notifications
    where created_at < (now() - interval '30 days')
    and type not in ('daily_digest', 'weekly_report');
end;
$$ language plpgsql security definer;

create or replace function public.generate_daily_digest()
returns void as $$
declare
    user_record record;
begin
    for user_record in
        select user_id
        from public.user_preferences
        where daily_digest = true
    loop
        insert into public.notifications (user_id, type, title, message, metadata)
        select
            user_record.user_id,
            'daily_digest',
            'Your Daily Todo Summary',
            'Here is your todo summary for today',
            jsonb_build_object(
                'total_todos', count(*),
                'completed_todos', count(*) filter (where completed = true),
                'overdue_todos', count(*) filter (where completed = false and date < current_date),
                'today_todos', count(*) filter (where date = current_date)
            )
        from public.todos
        where user_id = user_record.user_id
        and (date = current_date or (completed = false and date < current_date));
    end loop;
end;
$$ language plpgsql security definer;

create or replace function public.generate_weekly_report()
returns void as $$
declare
    user_record record;
begin
    for user_record in
        select user_id
        from public.user_preferences
        where weekly_report = true
    loop
        insert into public.notifications (user_id, type, title, message, metadata)
        select
            user_record.user_id,
            'weekly_report',
            'Your Weekly Todo Report',
            'Here is your todo report for the past week',
            jsonb_build_object(
                'total_todos', count(*),
                'completed_todos', count(*) filter (where completed = true),
                'completion_rate', (count(*) filter (where completed = true)::float / nullif(count(*), 0)::float * 100),
                'overdue_todos', count(*) filter (where completed = false and date < current_date),
                'categories', (
                    select jsonb_object_agg(category, total)
                    from (
                        select category, count(*) as total
                        from public.todos
                        where user_id = user_record.user_id
                        and created_at >= (current_date - interval '7 days')
                        group by category
                    ) categories
                )
            )
        from public.todos
        where user_id = user_record.user_id
        and created_at >= (current_date - interval '7 days');
    end loop;
end;
$$ language plpgsql security definer; 