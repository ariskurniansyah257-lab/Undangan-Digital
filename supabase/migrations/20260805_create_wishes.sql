create table if not exists wishes (
  id bigint generated always as identity primary key,
  name text not null,
  attendance text not null check (attendance in ('hadir','tidak','ragu')),
  guests smallint not null default 1 check (guests between 1 and 4),
  message text not null,
  created_at timestamptz not null default now()
);

alter table wishes enable row level security;

create policy "Anyone can read wishes"
  on wishes for select
  using (true);

create policy "Anyone can insert wishes"
  on wishes for insert
  with check (true);

create index wishes_created_at_idx on wishes (created_at desc);
