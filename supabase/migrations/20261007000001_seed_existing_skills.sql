insert into public.skills (name, category, icon, level, sort_order)
select seed.name, 'General', seed.icon, 0, seed.sort_order
from (
  values
    ('React', 'react/react-original.svg', 1),
    ('React Native', 'react/react-original.svg', 2),
    ('JavaScript', 'javascript/javascript-original.svg', 3),
    ('Three.js', 'https://cdn.simpleicons.org/three.js/ffffff', 4),
    ('Node.js', 'nodejs/nodejs-original.svg', 5),
    ('Firebase', 'firebase/firebase-plain.svg', 6),
    ('Supabase', 'supabase/supabase-original.svg', 7),
    ('MySQL', 'mysql/mysql-original.svg', 8),
    ('AWS', 'amazonwebservices/amazonwebservices-plain-wordmark.svg', 9),
    ('Vercel', 'https://cdn.simpleicons.org/vercel/ffffff', 10),
    ('Railway', 'railway/railway-original.svg', 11),
    ('Git', 'git/git-original.svg', 12),
    ('GitHub', 'https://cdn.simpleicons.org/github/ffffff', 13),
    ('MongoDB', 'mongodb/mongodb-original.svg', 14),
    ('Tailwind CSS', 'tailwindcss/tailwindcss-original.svg', 15),
    ('CSS', 'css3/css3-original.svg', 16),
    ('HTML', 'html5/html5-original.svg', 17),
    ('Bootstrap', 'bootstrap/bootstrap-original.svg', 18)
) as seed(name, icon, sort_order)
where not exists (
  select 1
  from public.skills as existing
  where lower(existing.name) = lower(seed.name)
);
