-- After creating a user in Supabase Auth, insert a matching profile.
-- Replace the UUID and email with values from Authentication → Users.

insert into user_profiles (id, email, full_name, role, is_active, created_at, updated_at)
values (
  '00000000-0000-0000-0000-000000000000',
  'editor@campus360.local',
  'Managing Editor',
  'EDITOR',
  true,
  now(),
  now()
);
