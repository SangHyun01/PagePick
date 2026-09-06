alter table public.notion_export_page_mappings
  alter column source_id type text using source_id::text;
