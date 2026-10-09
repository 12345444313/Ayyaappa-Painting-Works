-- =============================================
-- Ayyaappa Painting Works - Supabase schema.sql
-- Run this in Supabase SQL editor (Project > SQL > New query)
-- =============================================

-- ===== 1. EXTENSIONS =====
create extension if not exists "pgcrypto";

-- ===== 2. PROJECTS TABLE =====
-- Stores project gallery items. Public users can SELECT only.
create table if not exists public.projects (
    id          uuid primary key default gen_random_uuid(),
    title       text not null,
    description text,
    image_url   text not null,
    category    text,
    featured    boolean not null default false,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),

    constraint projects_title_length check (char_length(title) between 1 and 200)
);

create index if not exists projects_created_at_idx
    on public.projects (created_at desc);

create index if not exists projects_featured_idx
    on public.projects (featured)
    where featured = true;

create index if not exists projects_category_idx
    on public.projects (category);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
    before update on public.projects
    for each row execute function public.set_updated_at();

-- ===== 3. REVIEWS TABLE =====
-- Stores customer reviews. Public users can SELECT approved only, and INSERT new (unapproved).
create table if not exists public.reviews (
    id            uuid primary key default gen_random_uuid(),
    customer_name text not null,
    rating        smallint not null,
    review        text not null,
    approved      boolean not null default false,
    created_at    timestamptz not null default now(),

    constraint reviews_rating_range check (rating between 1 and 5),
    constraint reviews_name_length check (char_length(customer_name) between 1 and 80),
    constraint reviews_length check (char_length(review) between 10 and 600)
);

create index if not exists reviews_approved_created_idx
    on public.reviews (approved, created_at desc);

-- ===== 4. ENABLE ROW LEVEL SECURITY =====
alter table public.projects enable row level security;
alter table public.reviews  enable row level security;

-- ===== 5. POLICIES: PROJECTS =====
-- Public read access for all projects (gallery is fully public)
drop policy if exists "Public can view projects" on public.projects;
create policy "Public can view projects"
    on public.projects
    for select
    to anon, authenticated
    using (true);

-- NOTE: No INSERT/UPDATE/DELETE policies for anon/authenticated.
-- Projects are managed by the project owner via the Supabase dashboard
-- (or by a future owner dashboard using the service role key on a server).
-- This keeps the public site read-only for project data.

-- ===== 6. POLICIES: REVIEWS =====
-- Public can view only approved reviews
drop policy if exists "Public can view approved reviews" on public.reviews;
create policy "Public can view approved reviews"
    on public.reviews
    for select
    to anon, authenticated
    using (approved = true);

-- Public can submit reviews (always with approved = false enforced in app + by trigger)
drop policy if exists "Public can submit reviews" on public.reviews;
create policy "Public can submit reviews"
    on public.reviews
    for insert
    to anon, authenticated
    with check (
        approved = false
        and rating between 1 and 5
        and char_length(customer_name) between 1 and 80
        and char_length(review) between 10 and 600
    );

-- Force approved = false on insert (defense in depth)
create or replace function public.reviews_force_unapproved()
returns trigger as $$
begin
    new.approved := false;
    return new;
end;
$$ language plpgsql;

drop trigger if exists trg_reviews_force_unapproved on public.reviews;
create trigger trg_reviews_force_unapproved
    before insert on public.reviews
    for each row execute function public.reviews_force_unapproved();

-- NOTE: No UPDATE/DELETE policies for anon/authenticated.
-- Review approval/deletion is performed by the project owner via the Supabase dashboard.

-- =============================================
-- 7. SAMPLE DATA (FOR DEVELOPMENT ONLY)
-- =============================================
-- IMPORTANT: These are placeholder rows. Replace or delete before going live.
-- They are clearly marked so you can identify them.

insert into public.projects (title, description, image_url, category, featured) values
    ('Sample Villa Project',
     'PLACEHOLDER: Replace with a real completed project. Premium exterior painting with a 5-year durability guarantee.',
     'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200',
     'Exterior',
     true),

    ('Sample Living Room',
     'PLACEHOLDER: Replace with a real completed project. Soft ivory interior with elegant accent walls.',
     'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200',
     'Interior',
     false),

    ('Sample Office Space',
     'PLACEHOLDER: Replace with a real completed project. Modern commercial painting for a clean professional look.',
     'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200',
     'Commercial',
     false),

    ('Sample Texture Wall',
     'PLACEHOLDER: Replace with a real completed project. Decorative wall texture with a luxurious finish.',
     'https://images.unsplash.com/photo-1615873968403-89e068629265?w=1200',
     'Texture',
     false),

    ('Sample Bedroom',
     'PLACEHOLDER: Replace with a real completed project. Soft pastel palette for a calm bedroom retreat.',
     'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200',
     'Residential',
     false),

    ('Sample Renovation',
     'PLACEHOLDER: Replace with a real completed project. Complete repaint after a home renovation.',
     'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1200',
     'Renovation',
     false)
on conflict do nothing;

-- Sample approved reviews (clearly marked as placeholders)
insert into public.reviews (customer_name, rating, review, approved) values
    ('Sample Customer A', 5,
     'PLACEHOLDER: Excellent workmanship and very professional service. The team was punctual and the finish was beautiful.',
     true),
    ('Sample Customer B', 5,
     'PLACEHOLDER: Very happy with the painting work. Clean lines, neat handover, and great attention to detail.',
     true),
    ('Sample Customer C', 4,
     'PLACEHOLDER: Good quality work for our office. Will use again for future projects.',
     true)
on conflict do nothing;

-- =============================================
-- 8. STORAGE BUCKET
-- =============================================
-- Run this in SQL editor OR create the bucket manually in Supabase Storage UI.
-- Name: "projects"
-- Public: true (so image URLs are publicly accessible)

insert into storage.buckets (id, name, public)
values ('projects', 'projects', true)
on conflict (id) do nothing;

-- Allow public read access to all files in the projects bucket
drop policy if exists "Public can read project images" on storage.objects;
create policy "Public can read project images"
    on storage.objects
    for select
    to anon, authenticated
    using (bucket_id = 'projects');

-- NOTE: No INSERT/UPDATE/DELETE policies for anon on storage.
-- Project images are uploaded by the owner via the Supabase dashboard
-- (or by a future owner dashboard using the service role key on a server).

-- =============================================
-- DONE
-- =============================================
-- Next steps:
-- 1. Verify the tables exist:  select * from public.projects;
-- 2. Verify the bucket:        select * from storage.buckets;
-- 3. Update js/config.js with your Supabase URL and anon key.
-- 4. Replace sample data with your real projects and reviews.
-- 5. Mark approved = true on real reviews via the Supabase dashboard.
