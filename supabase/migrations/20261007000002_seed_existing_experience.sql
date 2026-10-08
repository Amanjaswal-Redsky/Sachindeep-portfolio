insert into public.experience (
  year, period, role, company, description, skills, focus, stage, type, projects, sort_order
)
select seed.year,
       seed.period,
       seed.role,
       seed.company,
       seed.description,
       seed.skills,
       seed.focus,
       seed.stage,
       seed.type,
       seed.projects,
       seed.sort_order
from (
  values
    ('2016', '2017', 'Junior Web Developer', 'Web Development', 'Started working with the fundamentals of web development and built responsive interfaces using HTML, CSS and JavaScript.', array['HTML', 'CSS', 'JavaScript']::text[], 'Web Fundamentals', 'Foundation', 'Web', 'Responsive Websites', 1),
    ('2017', '2018', 'Frontend Developer', 'Web Development', 'Focused on creating responsive and interactive user interfaces while improving frontend development skills and modern web practices.', array['HTML', 'CSS', 'JavaScript', 'Responsive Design']::text[], 'Frontend Development', 'Growth', 'Frontend', 'Interactive UI', 2),
    ('2018', '2019', 'React Developer', 'Frontend Development', 'Started building modern web applications using React with reusable components, state management and responsive user interfaces.', array['React', 'JavaScript', 'CSS', 'REST API']::text[], 'React Development', 'Specialization', 'React', 'React Applications', 3),
    ('2019', '2020', 'Frontend Engineer', 'Web Application Development', 'Worked on scalable frontend applications and developed reusable components with API integrations and modern JavaScript workflows.', array['React', 'JavaScript', 'API', 'Git']::text[], 'Web Applications', 'Engineering', 'Frontend', 'Scalable Interfaces', 4),
    ('2020', '2021', 'Full Stack Developer', 'Web Application Development', 'Expanded into full stack development by working with frontend applications, backend APIs, databases and authentication systems.', array['React', 'Node.js', 'API', 'Database']::text[], 'Full Stack', 'Expansion', 'Full Stack', 'Full Stack Apps', 5),
    ('2021', '2022', 'Full Stack Developer', 'Full Stack Development', 'Built complete web applications with frontend, backend services, authentication, database integrations and deployment workflows.', array['React', 'Node.js', 'Firebase', 'Supabase']::text[], 'Backend & Cloud', 'Cloud', 'Full Stack', 'Cloud Applications', 6),
    ('2022', '2023', 'React Native Developer', 'Mobile Application Development', 'Started developing cross-platform mobile applications using React Native with API integrations and reusable mobile components.', array['React Native', 'JavaScript', 'REST API', 'Firebase']::text[], 'Mobile Development', 'Mobile', 'React Native', 'Mobile Applications', 7),
    ('2023', '2024', 'React Native Developer', 'Mobile Application Development', 'Worked on production mobile applications with authentication, backend integrations, database services and performance improvements.', array['React Native', 'Firebase', 'Supabase', 'API']::text[], 'Production Apps', 'Production', 'Mobile', 'Production Apps', 8),
    ('2024', '2025', 'Full Stack / React Native Developer', 'Web & Mobile Development', 'Worked across web and mobile applications, building complete features from frontend interfaces to backend APIs and cloud services.', array['React', 'React Native', 'Node.js', 'Firebase', 'Supabase']::text[], 'Web & Mobile', 'Advanced', 'Web + Mobile', 'Digital Products', 9),
    ('2025', 'PRESENT', 'Full Stack Developer', 'Professional Experience', 'Building modern web and mobile applications with scalable architecture, API integrations, authentication, databases and real-time functionality.', array['React', 'React Native', 'Node.js', 'Firebase', 'Supabase', 'AWS']::text[], 'Scalable Systems', 'Professional', 'Full Stack', 'Production Systems', 10),
    ('2026', '2027', 'Full Stack / Mobile Developer', 'Advanced Application Development', 'Working with modern web and mobile technologies while focusing on scalable applications, cloud infrastructure and advanced API integrations.', array['React', 'React Native', 'Node.js', 'AWS', 'Supabase', 'Cloud']::text[], 'Cloud Architecture', 'Advanced Systems', 'Cloud + Mobile', 'Scalable Platforms', 11),
    ('2027', 'FUTURE', 'Full Stack Developer', 'Future Development', 'Continuing to build scalable digital products across web and mobile platforms with modern technologies, cloud services and advanced application architecture.', array['React', 'React Native', 'Node.js', 'Cloud', 'AWS', 'Full Stack']::text[], 'Future Technology', 'Future', 'Full Stack', 'Next Generation Apps', 12)
) as seed(year, period, role, company, description, skills, focus, stage, type, projects, sort_order)
where not exists (
  select 1
  from public.experience as existing
  where existing.year is not distinct from seed.year
    and existing.period is not distinct from seed.period
    and existing.role is not distinct from seed.role
    and existing.company is not distinct from seed.company
);
