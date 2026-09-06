alter table public.notion_export_archives
  alter column sentences_data_source_id drop not null,
  alter column memos_data_source_id drop not null;

alter table public.notion_export_page_mappings
  alter column notion_page_id drop not null,
  add column if not exists notion_block_id text;

create table if not exists public.notion_export_book_sections (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id bigint not null,
  sentences_section_block_id text not null,
  memos_section_block_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, book_id)
);

alter table public.notion_export_book_sections enable row level security;

revoke all on table public.notion_export_book_sections from anon, authenticated;
