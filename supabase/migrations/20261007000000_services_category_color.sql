alter table public.services add column if not exists category text;
alter table public.services add column if not exists color text;

with service_data(category, title, description, technologies, icon, color, sort_order) as (
  values
    ('FRONTEND', 'Web & Mobile', 'Building responsive websites and mobile applications using React and React Native.', array['React', 'React Native']::text[], '⌘', 'purple', 1),
    ('BACKEND', 'APIs & Databases', 'Creating reliable backend systems, API integrations, and database-driven applications.', array['Node.js', 'Firebase', 'Supabase']::text[], '</>', 'blue', 2),
    ('DEPLOYMENT', 'Cloud & Hosting', 'Deploying and maintaining applications using modern hosting and cloud platforms.', array['Vercel', 'Railway', 'AWS']::text[], '↗', 'orange', 3),
    ('APPROACH', 'Clean & Scalable', 'Writing maintainable code and building smooth, practical digital experiences.', array['Clean Code', 'Performance']::text[], '✦', 'pink', 4)
), updated as (
  update public.services as existing
  set category = service_data.category,
      title = service_data.title,
      description = service_data.description,
      technologies = service_data.technologies,
      icon = service_data.icon,
      color = service_data.color,
      sort_order = service_data.sort_order
  from service_data
  where upper(coalesce(existing.category, '')) = service_data.category
     or existing.title = service_data.title
  returning upper(coalesce(existing.category, '')) as category
)
insert into public.services (category, title, description, technologies, icon, color, sort_order)
select service_data.category,
       service_data.title,
       service_data.description,
       service_data.technologies,
       service_data.icon,
       service_data.color,
       service_data.sort_order
from service_data
where not exists (
  select 1
  from public.services as existing
  where upper(coalesce(existing.category, '')) = service_data.category
     or existing.title = service_data.title
);
