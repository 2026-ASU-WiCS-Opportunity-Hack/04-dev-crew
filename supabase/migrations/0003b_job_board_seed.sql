-- Seed data for job_listings
-- Run this in Supabase SQL Editor after running 0003_job_board.sql

insert into public.job_listings (organization, title, description, engagement_type, location, is_remote, compensation, requirements, apply_deadline, is_active)
values
  (
    'Global Leadership Institute',
    'Action Learning Coach – Leadership Program',
    'We are seeking a certified WIAL Action Learning Coach to facilitate leadership development sessions for our senior executive cohort. You will design and lead bi-weekly Action Learning sets, coach problem-solving teams, and provide individual coaching feedback. This is a high-impact engagement with a Fortune 500 client base.',
    'contract',
    'New York, USA',
    false,
    '$180–$220/hr',
    'PALC or above certification required. Minimum 2 years of Action Learning facilitation experience.',
    now() + interval '30 days',
    true
  ),
  (
    'Horizon Consulting Group',
    'Remote Action Learning Facilitator',
    'Horizon Consulting is looking for an experienced Action Learning Coach to join our virtual delivery team. You will co-facilitate global Action Learning programs for multinational clients across EMEA and APAC. Flexible scheduling, fully remote, and collaborative team environment.',
    'part_time',
    null,
    true,
    '$120–$150/hr',
    'CALC certification minimum. Experience with virtual facilitation tools (Zoom, Miro) preferred.',
    now() + interval '21 days',
    true
  ),
  (
    'PeopleFirst HR Solutions',
    'Action Learning Coach – Talent Development',
    'PeopleFirst is partnering with mid-size organizations to build internal coaching cultures. We need an Action Learning Coach to deliver a 6-month cohort program, train internal coaches, and evaluate team performance outcomes. This is a full engagement with possibility of extension.',
    'project',
    'Chicago, USA',
    true,
    '$15,000–$20,000 per cohort',
    'SALC or MALC preferred. Prior experience designing Action Learning curricula is a strong plus.',
    now() + interval '14 days',
    true
  ),
  (
    'Meridian Healthcare Network',
    'Full-time Organizational Coach',
    'Meridian Healthcare Network is expanding its internal People & Culture team. We are hiring a full-time Action Learning Coach to embed within our organization, design team problem-solving workshops, and develop our next generation of nurse leaders through structured Action Learning sets.',
    'full_time',
    'Boston, USA',
    false,
    '$95,000–$115,000/year',
    'PALC certification required. Healthcare or non-profit sector experience is highly desirable.',
    now() + interval '45 days',
    true
  ),
  (
    'Catalyst Education Foundation',
    'Action Learning Coach – Youth Leadership',
    'Catalyst works with university students and young professionals across Latin America. We are looking for a bilingual (English/Spanish or English/Portuguese) Action Learning Coach to facilitate quarterly leadership intensives. Remote-first, mission-driven organization.',
    'contract',
    null,
    true,
    '$100–$130/hr',
    'CALC or above. Bilingual (English + Spanish or Portuguese) strongly preferred. Experience with youth or academic audiences is a bonus.',
    now() + interval '60 days',
    true
  );
